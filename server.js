import express from 'express'
import cors from 'cors'
import { readdirSync } from 'fs'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
const morgan = require('morgan')
require('dotenv').config()

// create express app
const app = express()

// db
mongoose
  .connect(process.env.DATABASE, {
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
    writeConcern: {
      j: true,
    },
  })
  .then(() => console.log('**DB CONNECTED**'))
  .catch(err => console.log('DB CONNECTION ERR => ', err))

// Middlewares
const corsConfig = {
  origin: true,
  credentials: true,
}
app.use(cors(corsConfig))
app.options('*', cors(corsConfig))
app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())
app.use(morgan('dev'))

// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
//   res.header('Access-Control-Allow-Credentials', true)
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   )
//   next()
// })

// route
readdirSync('./routes').map(r => app.use('/api', require(`./routes/${r}`)))

// port
const port = process.env.PORT || 8000

app.listen(port, () => console.log(`Server is running on port ${port}`))
