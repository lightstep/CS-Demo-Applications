const async = require('async')
const schedule = require('node-schedule')
const logger = require('./logger')
const api = require('./api')
const { tracer } = require('./tracer')
const { context, setSpan } = require('@opentelemetry/api')
const constants = require('./constants')

const redis = require('redis')
const publisher = redis.createClient({
  host: constants.REDIS_HOST,
  port: constants.REDIS_PORT
})

const ServiceModel = require('./models/service')

function syncStreams() {
  // This function finds all streams created on a component or service
  // Then gets their last 10 minutes of exemplar traces
  // And adds them to a queue to be processed for service diagram
  logger.info('Syncing Streams')
  const span = tracer.startSpan('syncStreams')
  context.with(setSpan(context.active(), span), () => {
    api.getStreams().then((res) => {
      let streams = res.data

      streams = streams.map((s) => {
        return s.id
      })

      async.each(
        streams,
        (sid, cb) => {
          const streamSpan = tracer.startSpan('syncStream')
          streamSpan.setAttribute('stream-id', sid)
          context.with(setSpan(context.active(), streamSpan), () => {
            api
              .getStreamTimeseries(sid)
              .then((r) => {
                if (r.data.attributes.exemplars) {
                  logger.info(
                    `Found: ${r.data.attributes.exemplars.length} exemplars for Stream ${sid}`
                  )
                  let exemplars = r.data.attributes.exemplars.map((e) => {
                    return e.span_guid
                  })
                  async.each(
                    exemplars,
                    (e, callback) => {
                      publisher.publish('traces', e, () => {
                        callback()
                      })
                    },
                    (err) => {
                      streamSpan.end()
                      cb()
                    }
                  )
                }
              })
              .catch((err) => {
                streamSpan.setAttribute('error', true)
                streamSpan.end()
                cb(err)
              })
          })
        },
        (err) => {
          if (err) {
            span.setAttribute('error', true)
          }
          span.end()
        }
      )
    })
  })
}

function syncServices() {
  // This function keeps an upd to date list of services from Service Directory
  logger.info('Syncing Services')
  const span = tracer.startSpan('syncServices')
  context.with(setSpan(context.active(), span), () => {
    api
      .getServices()
      .then((res) => {
        let services = res.data.items
        span.addEvent(`Services: ${services.length}`)
        let bulkOps = []
        services.forEach((s) => {
          let upsertDoc = {
            updateOne: {
              filter: { name: s.attributes.name },
              update: {
                $set: {
                  name: s.attributes.name,
                  lastSeen: Date.parse(s.attributes.last_seen)
                }
              },
              upsert: true
            }
          }
          bulkOps.push(upsertDoc)
        })
        ServiceModel.collection
          .bulkWrite(bulkOps)
          .then((result) => {
            span.addEvent(`Services Upserted`)
            logger.info(JSON.stringify(result, null, 2))
            span.end()
          })
          .catch((err) => {
            span.setAttribute('error', true)
            span.end()
            logger.error(JSON.stringify(err, null, 2))
          })
      })
      .catch((err) => {
        span.setAttribute('error', true)
        span.end()
        if (err.response) {
          logger.error(err.response.status)
        } else if (err.request) {
          logger.error(err.request)
        } else {
          logger.error(err.message)
        }
      })
  })
}

function startScheduler() {
  let rule = new schedule.RecurrenceRule()
  rule.minute = new schedule.Range(0, 59, constants.SCHEDULER_INTERVAL_MINUTES)

  // Run once on start, comment out if testing or developing
  syncServices()
  syncStreams()
  // Schedule future runs
  schedule.scheduleJob(rule, () => {
    syncServices()
    syncStreams()
  })

  logger.info('Scheduler started')
}

module.exports = {
  startScheduler
}
