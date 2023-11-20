import express from 'express'
import cors from 'cors'
import pg from 'pg'
import dotenv from 'dotenv'
import session from 'express-session'
import http from 'http'
import { Server } from 'socket.io'

dotenv.config()
const app = express()
const port = process.env.PORT
const server = http.createServer(app)
const io = new Server(server)

app.use(cors())
app.use(express.json())

const init=()=>{
    app.use(express.static('public'))
    app.use(session({
        secret:'your-secret-key',
        resave:false,
        saveUnitialized:true
    }))

    socketEvents()

    getData()
    postData()
    // patchData()

    server.listen(port,()=>{console.log(`listening on ${port}`)})
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
                    pool.query(`select * from curr_lobby where id=${paramsArr[2]}`)
                    .then(result=>{res.send(result.rows)})
                }
                else{
                    pool.query('select * from curr_lobby')
                    .then(result=>{res.send(result.rows)})
                }
                break;
            case 'players':
                pool.query(`select * from players where lID=${paramsArr[2]}`)
                .then(result=>{res.send(result.rows)})
                break;
            case 'test':
                pool.query('select * from curr_lobby join teams on curr_lobby.id=teams.lID join coop_lb on teams.id=coop_lb.tID')
                .then(result=>{res.send(result.rows)})
                break;
        }
    })
}

const postData=()=>{
    app.post(/^\/.*$/,(req,res)=>{
        const paramsArr=req.url.split('/')
        switch(paramsArr[1]){
            case 'lobby':
                pool.query(`insert into curr_lobby (name,type,pCount,public,host) values ('${req.body.name}','${req.body.type}',0,${req.body.public},'${req.body.player}') returning *`)
                .then(result=>{
                    res.send(result.rows)
                })
                io.emit('newLobby')
                console.log('new lobby')
        }
    })
}

// const patchData=()=>{
//     app.put(/^\/.*$/,(req,res)=>{
//         const paramsArr=req.url.split('/')
//         switch(paramsArr[1]){
//             case 'lobby':
//                 pool.query(`update players set lID=${req.body.lobby} where name='${req.body.player}' returning *`)
//                 .then(result=>{
//                     res.send(result.rows)
//                 })
//         }
//     })
// }

const socketEvents=()=>{
    io.on('connection',(socket)=>{
        console.log('user connected')

        socket.on('disconnect',(reason)=>{
            pool.query(`select * from players where sessID='${socket.id}'`)
            .then(result=>{
                if(result.rows.length!==0){
                    lobbyDoor('exit',result.rows[0].lid,socket.id)
                }
            })
        })
        
        socket.on('userCreated',(message)=>{
            console.log(message,socket.id)
            pool.query(`select * from players where name='${message}' or sessID='${socket.id}'`)
            .then(result=>{
                if(result.rows.length===0){
                    pool.query(`insert into players (name,sessID,currP) values ('${message}','${socket.id}',0)`)
                    console.log('new player')
                }
                else{
                    result.rows[0].name===message?
                        pool.query(`update players set sessID='${socket.id}' where name='${message}'`):
                        pool.query(`update players set name='${message}' where sessID='${socket.id}'`)
                    console.log('user updated')
                }
            })
        })

        socket.on('lobbyJoin',(lID)=>{
            lobbyDoor('enter',lID,socket,io)

        })
        socket.on('lobbyLeave',(lid)=>{
            console.log(socket,'socket')
            lobbyDoor('exit',lid,socket,io)
        })
        socket.on('kickPlease',(lid)=>{
            socket.leave(lid.toString())
        })
        socket.on('startGame',(lid)=>{
            pool.query(`select * from players where lID=${lid} order by currP desc`)
            .then((result)=>{
                console.log(result.rows)
                io.to(lid.toString()).emit('startGame',result.rows)
            })
        })
        socket.on('update',(lid,score,fruit)=>{
            pool.query(`update players set currP=${score} where sessID='${socket.id}'`)
            pool.query(`select * from players where lID=${lid} order by currP desc`)
            .then((result)=>{
                console.log(result.rows)
                io.to(lid.toString()).emit('update',result.rows,fruit)
            })
        })
    })
}

const lobbyDoor=(direction,lid,soInst,ioInst)=>{
    const room=lid.toString()
    if(direction==='enter'){
        pool.query(`update curr_lobby set pCount = pCount + 1 where id=${lid}`)
        pool.query(`update players set lID=${lid} where sessID='${soInst.id}'`)
        soInst.join(room)
        ioInst.to(room).emit('lChange')
    }
    else if(direction==='exit'){
        pool.query(`select * from players join curr_lobby on players.name=curr_lobby.host where players.sessID='${soInst.id}'`)
        .then(result=>{
            if(result.rows.length===1){
                pool.query(`update players set lID=NULL where lid=${result.rows[0].lid}`)
                pool.query(`delete from curr_lobby where id=${result.rows[0].lid}`)
                ioInst.to(room).emit('lDelete',result.rows[0].lid)
            }
            else{
                pool.query(`update curr_lobby set pCount=pCount-1 where id=${lid}`)
                pool.query(`update players set lID=NULL where sessID='${soInst.id}'`)
                console.log(soInst)
                soInst.leave(room)
                ioInst.to(room).emit('lChange')
            }
        })
    }
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