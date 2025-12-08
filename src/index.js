import dotenv from 'dotenv'
import ConnectDB from './db/index.js'
import { app } from './app.js'

const PORT = process.env.PORT || 5000

dotenv.config({
  path:'.env'
})

app.on("error" ,(error) => {
  console.log("Server Error : ",error)
  process.exit(1)
})

const serverStart = async () => {
  try {
    await ConnectDB()
    app.listen(PORT || 5000,()=>{
      console.log(` server is running at port ${PORT}`)
    })
    
  } catch (error) {
    console.log("Error : ",error)
    process.exit(1);
  }
}

serverStart()