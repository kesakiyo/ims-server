/* External dependencies */
import * as express from 'express'

/* Internal dependencies */
import test from './routes/test'

const app = express()
const router = express.Router()

app.use('/v1', (() => {
  router.use('/test', test)

  return router
})())

app.listen(3000, () => {
  console.log('ims-server app listening on port 3000')
})