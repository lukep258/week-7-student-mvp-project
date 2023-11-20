import express from 'express'
import cors from 'cors'
import pg from 'pg'
import dotenv from 'dotenv'
import session from 'express-session'

dotenv.config()
const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())

const init=()=>{
    app.use(express.static('public'))
    app.use(session({
        secret:'your-secret-key',
        resave:false,
        saveUnitialized:true
    }))

    app.use((req,res,next)=>{//test request console
        // console.log(req.url,req.method,req.body)
        next()
    })

    getData()
    postData()
    patchData()

    app.use((req,res,next)=>{
    })
    

    app.listen(port,()=>{console.log(`listening on ${port}`)})
}

const getData=()=>{
    app.get('*',(req,res)=>{
        const paramsArr=req.url.split('/')
        switch(paramsArr[1]){
            case 'assets':
                res.sendFile(`./assets/${paramsArr[2]}`,{root:'./'})
                break;
            case 'lobby':
                if(paramsArr[2]){
                    pool.query(`update curr_lobby set pCount = pCount + 1 where id=${paramsArr[2]}`)
                }
                pool.query('select * from curr_lobby')
                .then(result=>{res.send(result.rows)})
                break;
            case 'test':
                pool.query('select * from curr_lobby join teams on curr_lobby.id=teams.lID join coop_lb on teams.id=coop_lb.tID')
                .then(result=>{
                    res.send(result.rows)}
                )
                break;
            case 'cookie':
                console.log(req.session)
                if(!req.session.userID){
                    req.session.userID=uniqueID()
                }
                res.send(`your session id is: ${req.session.userID}`)
                break
        }
    })
}

const postData=()=>{
    app.post(/^\/.*$/,(req,res)=>{
        console.log(req.url)
        console.log(req.body)
        const paramsArr=req.url.split('/')
        switch(paramsArr[1]){
            case 'cookie':
                setUser(req.session.userID,req.body.name)
                break
            case 'lobby':
                pool.query(`insert into curr_lobby (name,type,pCount,public) values ('${req.body.name}','${req.body.type}',1,${req.body.public}) returning *`)
                .then(result=>res.send(result.rows))
                console.log('new lobby')

                pool.query(`select * from curr_lobby order by id desc limit 1`)
                .then(result=>{
                    console.log(result.rows)
                })
                console.log('foreign key updated')
        }
    })
}

const patchData=()=>{
    app.put(/^\/.*$/,(req,res)=>{
        console.log(req.url)
        console.log(req.body)
        const paramsArr=req.url.split('/')
        switch(paramsArr[1]){
            case 'lobby':
                pool.query(`update players set lID=${req.body.lobby} where name='${req.body.player}' returning *`)
                .then(result=>{
                    console.log(result.rows)
                    res.send(result.rows)
                })
        }
    })
}

const setUser=(userID,username)=>{
    pool.query(`select * from players where name='${username}' or sessID=${userID}`)
    .then(result=>{
        console.log(result.rows)
        console.log(result.rows.length)
        if(result.rows.length===0){
            pool.query(`insert into players (name,sessID) values ('${username}',${userID})`)
            console.log('new player')
        }
        else{
            result.rows[0].name===username?
                pool.query(`update players set sessID=${userID} where name='${username}'`):
                pool.query(`update players set name='${username}' where sessID=${userID}`)
            console.log('user updated')
        }
    })
}

const uniqueID=()=>{
    return Math.floor(Math.random()*(10**8))
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