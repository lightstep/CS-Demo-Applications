// Lightstep API (REQUIRED)
const HOST = 'https://api.lightstep.com'
const ORG = process.env.LIGHTSTEP_ORG || ''
const PROJECT = process.env.LIGHTSTEP_PROJECT || ''
const API_KEY = process.env.LIGHTSTEP_API_KEY || ''

// MongoDB (Defaults will work)
const MONGO_HOST = process.env.MONGO_HOST || '127.0.0.1'
const MONGO_PORT = process.env.MONGO_PORT || '27017'
const MONGO_DB_NAME = process.env.MONGO_DB || 'lightstep'
const MONGO_USER = process.env.MONGO_USER || 'lightstep'
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'lightstep'
const MONGO_URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB_NAME}`

// Redis (Defaults will work)
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'
const REDIS_PORT = process.env.REDIS_PORT || 6379

// Enable Tracing (optional)
// Setting an access token will report spans to Lightstep Public Satellites
// See `@/server/src/server-init.js` for advanced configuration
const LS_ACCESS_TOKEN = process.env.LIGHTSTEP_ACCESS_TOKEN || ''

// App specific constants
const STREAM_TIME_AGO_MINUTES = 10 // Sets the youngest time Stream Timeseries
const STREAM_TIME_RANGE_MINUTES = 2 // Subtract from youngest time to set time range for how many minutes of spans to get
const ENABLE_SCHEDULER = process.env.ENABLE_SCHEDULER == 'true' // disabling runs the server with existing data in MongoDB, and no new data from Lightstep is synced
const SCHEDULER_INTERVAL_MINUTES = 20 // run scheduler every 20 minutes, from the top of the hour
const SERVER_PORT = 8080 // which port to serve the API on

module.exports = {
  MONGO_URL,
  REDIS_HOST,
  REDIS_PORT,
  HOST,
  ORG,
  PROJECT,
  API_KEY,
  LS_ACCESS_TOKEN,
  STREAM_TIME_AGO_MINUTES,
  STREAM_TIME_RANGE_MINUTES,
  ENABLE_SCHEDULER,
  SCHEDULER_INTERVAL_MINUTES,
  SERVER_PORT
}
