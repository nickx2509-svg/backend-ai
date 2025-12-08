import express from "express"
import cors from "cors"
import path from 'path'
import cookieParser from "cookie-parser"
const app = express()

const limit = '30kb'

app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}))

app.use(express.json({limit:limit}))

app.use(express.urlencoded({
  extended:true,
  limit:limit
}))

app.use(express.static(path.join(process.cwd(),"public")))

app.use(cookieParser())

app.get('/',(req,resp)=>{
  resp.status(200).send('nick')
})

export { app  }

