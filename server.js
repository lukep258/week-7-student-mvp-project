import express from 'express'
import cors from 'cors'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const port = process.env.PORT
app.use(cors())
app.use(express.json())

const init=()=>{
    app.use((req,res,next)=>{//test request console
        console.log(req.url,req.method,req.body)
        next()
    })
    app.use(express.static('public'))

    getData()

    app.listen(port,()=>{console.log(`listening on ${port}`)})
}

const getData=()=>{
    app.get(/^\/(.*)$/,(req,res)=>{
        const paramsArr=req.params['0'].split('/')
        console.log(paramsArr)
        switch(paramsArr[0]){
            case 'assets':
                res.sendFile(`./assets/${paramsArr[1]}`,{root:'./'})
                break;
            case 'lobby':
                pool.query('select * from curr_lobby')
                .then(result=>{res.send(result.rows)})
                break;
            case 'test':
                pool.query('select * from curr_lobby join teams on curr_lobby.id=teams.lID join coop_lb on teams.id=coop_lb.tID')
                .then(result=>{
                    res.send(result.rows)}
                )
                break;

        }
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