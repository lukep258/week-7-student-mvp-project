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
        console.log(req.url,req.method,req.body)
        next()
    })

    getData()

    app.use(express.static('public'))
    app.listen(port,()=>{console.log(`listening on ${port}`)})
}

const getData=()=>{
    app.get('/test',(req,res)=>{
        console.log('getting')
        pool.query('select * from curr_lobby join teams on curr_lobby.id=teams.lID join coop_lb on teams.id=coop_lb.tID')
        .then(result=>{
            res.send(result.rows)}
        )        
    })
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

const pool = newPool()
init()