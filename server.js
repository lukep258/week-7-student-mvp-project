import express from 'express'
import cors from 'cors'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT
app.use(cors())
app.use(express.json())
console.log(process.env.port)

const init=()=>{
    app.use((req,res,next)=>{//test request console
        console.log(req.method,req.body,req.url)
        res.send('good test')
    })

    app.use(express.static('public'))
    app.listen(port,()=>{console.log(`listening on ${port}`)})
}

const newPool=()=>{
    const connectionString=process.env.DATABASE_URL||{
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    }

    const pool=new pg.Pool({connectionString})
    return pool
}

const pool = newPool
init()