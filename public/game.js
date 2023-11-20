const socket = io();

var fruitTypes = {
    cherry:{
        weight:2,
        size:50
    },
    strawberry:{
        weight:4,
        size:75
    },
    grape:{
        weight:6,
        size:100
    },
    tangerine:{
        weight:8,
        size:115
    },
    orange:{
        weight:10,
        size:150
    },
    apple:{
        weight:12,
        size:175
    },
    pear:{
        weight:14,
        size:185
    },
    peach:{
        weight:16,
        size:250
    },
    pineapple:{
        weight:18,
        size:300
    },
    melon:{
        weight:20,
        size:425
    },
    watermelon:{
        weight:22,
        size:550
    }
}
var nextFruit = {}
var fruitHand = {}
var fruitsDropped = []
var score = 0
let refresh
let max = 0
let screen = 'user'
let pName = 'pizza'
let lobbyType = 'comp'
let public = true;
let input1
let input2
let input3
let players = []
let lobbyID = 14
let host = false
let place = 0
let otherScores=[]


function preload(){
    for(let key in fruitTypes){
        fruitTypes[key].image=loadImage(`./assets/${key}.png`)
        fruitTypes[key].nextImage=loadImage(`./assets/${key}.png`)
    }
    refresh=loadImage('./assets/refresh.png')
}

//p5 functions
function setup(){
    var cnv = createCanvas(700,1150)
    cnv.attribute('class','game')
    for(let key in fruitTypes){
        fruitTypes[key].image.resize(fruitTypes[key].size,fruitTypes[key].size)
        fruitTypes[key].nextImage.resize(60,60)
    }
    refresh.resize(30,30)
    fruitHand=new handyFruit(randomFruit())
    nextFruit=randomFruit()
}


async function draw(){  
    background(230, 176, 78)  
    switch(screen){
        case 'user':
            noLoop()
            setUser()
            break
        case 'menu':
            noLoop()
            menu()
            break
        case 'lobbySearch':
            noLoop()
            await lobbyList()
            break
        case 'lobbyJoin':
            noLoop()
            typeLID()
            break
        case 'lobbyCreate':
            noLoop()
            lobbySettings()
            break
        case 'lobbyWait':
            noLoop()
            waiting()
            break
        case 'game':
            noLoop()
            await fruitGame()
            break
        case 'gameEnd':
            noLoop()
            gameOver()
            break
    }
}


function mouseClicked(){
    switch(screen){
        case 'user':
            enterUser()
            break
        case 'menu':
            menuSelect()
            break
        case 'lobbySearch':
            lobbySelect()
            break
        case 'lobbyJoin':
            joinLID()
            break
        case 'lobbyCreate':
            createLobby()
            break
        case 'lobbyWait':
            startGame()
            break
        case 'game':
            fruitDrop()
            break
        case 'gameEnd':
            nextGame()
            break
    }
}



//constructor-type functions
function handyFruit(type){
    this.type=type
    this.typeObj={...fruitTypes[type]}
    this.r=this.typeObj.size/2
    this.pos=createVector(mouseX,178.75-this.r)

    this.show=function(){
        if(this.pos.x<this.r){
            this.pos.x=this.r
        }
        if(this.pos.x>width-this.r){
            this.pos.x=width-this.r
        }
        image(this.typeObj.image,this.pos.x-this.r,this.pos.y-this.r)
        this.update()
    }

    this.update=function(){
        var mouse = createVector(mouseX,this.pos.y)
        mouse.sub(this.pos)
        this.pos.add(mouse)
    }
}

function droppedFruit(x,y,type){
    this.type=type
    this.typeObj={...fruitTypes[type]}
    this.r=this.typeObj.size/2
    this.pos=createVector(x,y)
    this.v=createVector(0,3)

    this.show=function(){
        image(this.typeObj.image,this.pos.x-this.r,this.pos.y-this.r)
        this.fall()
    }

    this.fall=function(){
        this.v.y+=0.3
        this.v.x=this.v.x*0.98||0
        this.pos.add(this.v)
        if(this.pos.x<this.r){
            this.pos.x=this.r
            this.v.x=-this.v.x*0.2||0
        }
        if(this.pos.x>width-this.r){
            this.pos.x=width-this.r
            this.v.x=-this.v.x*0.2||0
        }
        if(this.pos.y<this.r){
            this.pos.y=this.r
            this.v.y=-this.v.y||0
        }
        if(this.pos.y>height-this.r){
            this.pos.y=height-this.r
            this.v.y=-this.v.y*0.2||0
        }
    }

    this.collide=function(other,thisIndex,otherIndex){
        if(other==this){
            return
        }
        let dVector=p5.Vector.sub(other.pos,this.pos)
        let d = dVector.mag()-(this.r+other.r)
        let weightRatio=this.typeObj.size/(this.typeObj.size+other.typeObj.size)

        let thisDisp=dVector.copy().setMag(abs(d*(weightRatio)))
        let otherDisp=dVector.copy().setMag(abs(d*(1-weightRatio)))

        let dVectorNormal=dVector.copy().normalize()
        let approachSpeed=(this.v.dot(dVectorNormal)+-other.v.dot(dVectorNormal))
        let thisVector=dVectorNormal.copy().setMag(approachSpeed*weightRatio)
        let otherVector=dVectorNormal.copy().setMag(approachSpeed*(1-weightRatio))
        if(d<0){
            if(other.type!==this.type){
                if(this.pos.y===height-this.r){
                    other.pos.add(otherDisp)
                }
                if(other.pos.y===height-other.r){
                    this.pos.sub(thisDisp)
                }
                else{
                    this.pos.sub(thisDisp)
                    other.pos.add(otherDisp)
                }
                this.v.sub(thisVector)
                other.v.add(otherVector)
            }
            else{
                this.v.add(thisVector.setMag(approachSpeed*0.1))
                other.v.sub(otherVector.setMag(approachSpeed*0.1))
                this.merge(other,thisIndex,otherIndex)
            }
        }
    }

    this.merge = function(other,thisIndex,otherIndex){
        if(other==this){
            return
        }

        var d=p5.Vector.dist(this.pos,other.pos)
        if (d<this.r*0.75&&this.type===other.type){
            const fruitTypeArr=Object.keys(fruitTypes)
            const typeIndex=fruitTypeArr.indexOf(this.type)
            const middle=[(this.pos.x+other.pos.x)/2,(this.pos.y+other.pos.y)/2]

            if(thisIndex>otherIndex){
                fruitsDropped.splice(thisIndex,1)
                fruitsDropped.splice(otherIndex,1)
            }
            else{
                fruitsDropped.splice(thisIndex,1)
                fruitsDropped.splice(otherIndex,1)
            }
            if(typeIndex===max&&max<4){
                max++
            }
            score+=this.typeObj.weight
            socket.emit('update',lobbyID,score,fruitTypeArr[random(typeIndex)])
            fruitsDropped.unshift(new droppedFruit(middle[0],middle[1],fruitTypeArr[typeIndex+1]))
            console.log(fruitsDropped,score)
        }
    }
}


//user page
const setUser=()=>{
    createRect(width/2-65,height/2-30,width/2+65,height/2+10,[25,25,25,25],[255, 47, 36],[0, 138, 9],2)
    createText(width/2,height/2-100,'Enter Username:',50)
    createText(width/2,height/2,'Continue',30)

    input1 = createInput().position(width/2-150,displayHeight/2-230)
    input1.attribute('placeholder',`username`)
    input1.addClass('input')
}

const enterUser=()=>{
    const lName = input1.value()
    if(mouseX>width/2-65&&mouseX<width/2+65&&mouseY>height/2-30&&mouseY<height/2+10&&lName!==''){
        for(let key of selectAll('input')){
            key.remove()
        }
        pName = lName
        screen = 'menu'
        socket.emit('userCreated',lName)
        loop()
    }
    else if(mouseX>width/2-65&&mouseX<width/2+65&&mouseY>height/2-30&&mouseY<height/2+10){
        createText(width/2,height/2+50,'Enter a username',20,undefined,[255,0,0])
    }
}


//main menu
const menu=()=>{
    createRect(0,0,width,height/3,undefined,[0, 208, 255])
    strokeWeight(1)
    textSize(50)
    fill(0)
    textFont('Berthold Akzidenz Condensed')
    textAlign(CENTER)
    text('Suika Multiplayer',width/2,height/2-50)
    fill(100)
    rect(width/2-100,height/2-30,200,80,25,25,25,25)
    rect(width/2-100,height/2+90,200,80,25,25,25,25)
    fill(0)
    textSize(30)
    text('Browse\nLobbies',width/2,height/2)
    text('Join\nLobby ID',width/2,height/2+120)
    image(fruitTypes.watermelon.image,width/2-500,height/2-660)
    image(fruitTypes.melon.image,width/2,height/2-520)
    image(fruitTypes.peach.image,width/2-500,height/2-350)
    image(fruitTypes.apple.image,width/2-140,height/2-270)
    image(fruitTypes.grape.image,width/2,height/2-200)
    image(fruitTypes.strawberry.image,width/2-210,height/2-175)
    image(fruitTypes.strawberry.image,width/2+200,height/2-175)
    image(fruitTypes.cherry.image,width/2-150,height/2-150)
    image(fruitTypes.cherry.image,width/2-300,height/2-150)
    image(fruitTypes.cherry.image,width/2+150,height/2-150) 
}

const menuSelect=()=>{
    if(mouseX>width/2-100&&mouseX<width/2+100&&mouseY>height/2-30&&mouseY<height/2+50){
        screen='lobbySearch'
    }
    if(mouseX>width/2-100&&mouseX<width/2+100&&mouseY>height/2+90&&mouseY<height/2+170){
        screen='lobbyJoin'
    }
    loop()
}


//lobby browser
const lobbyList=async()=>{
    createBack()
    createRect(50,125,650,875,undefined,[237, 191, 107])
    createRect(50,125,650,200,undefined,[199, 147, 52])
    createRect(width-200,50,width-50,100,undefined,[161, 242, 138],undefined,)
    createRect(width-255,50,width-205,100,undefined,[201, 201, 201])
    createText(70,175,'LobbyID',20,undefined,undefined,undefined,undefined,LEFT)
    createText(250,100,'Lobbies',50)
    createText(200,175,'Name',20,undefined,undefined,undefined,undefined,LEFT)
    createText(450,175,'Players',20,undefined,undefined,undefined,undefined,LEFT)
    createText(550,175,'Type',20,undefined,undefined,undefined,undefined,LEFT)
    createText(width-125,85,'Create Lobby',20,undefined,undefined,undefined,undefined,CENTER)
    image(refresh,width-245,60)
    await httpGet('/lobby','json',(res)=>{
        let lobby=[...res]
        console.log(lobby)
        for(let i=0,j=0;i<lobby.length&&j<9;i++,j++){
            if(lobby[i].public===false){
                j--
                continue
            }
            let refY=200+(j*75)
            createLine(50,refY,650,refY,undefined,2)
            createLine(50,refY+75,650,refY+75,undefined,2)
            createText(100,refY+50,lobby[i].id,30,undefined,undefined,undefined,undefined,LEFT)
            createText(200,refY+50,lobby[i].name,20,undefined,undefined,undefined,undefined,LEFT)
            createText(475,refY+50,lobby[i].pcount||0,20,undefined,undefined,undefined,undefined,LEFT)
            createText(550,refY+50,lobby[i].type,20,undefined,undefined,undefined,undefined,LEFT)
        }
    })
}

const lobbySelect=()=>{
    console.log(mouseX,mouseY)
    if(mouseX>20&&mouseX<70&&mouseY>20&&mouseY<70){
        console.log('going to menu',mouseX,mouseY)
        screen='menu'
        loop()
    }
    else if(mouseX>width-200&&mouseX<width-50&&mouseY>50&&mouseY<100){
        console.log('going to lobby creation',mouseX,mouseY)
        screen='lobbyCreate'
        loop()
    }
    else if(mouseX>50&&mouseX<650&&mouseY>125&&mouseY<875){
        httpGet('./lobby','json',(data)=>{
            for(let i=0;i<9;i++){
                let refY=200+(i*75)
                if(mouseY>refY&&mouseY<refY+75){
                    lobbyID=data[i].id
                    screen='lobbyWait'
                    socket.emit('lobbyJoin',lobbyID)
                }
            }
        })
        loop()
    }
    else if(mouseX>width-255,mouseX<width-205,mouseY>50,mouseY<100){
        loop()
    }
}


//join lobby ID
const typeLID=()=>{
    createBack()
    createRect(100,170,300,210,[25,25,25,25],[255, 47, 36],[0, 138, 9],2)
    createText(250,100,'Join Game by ID',50)
    createText(150,150,'Lobby ID:',30)
    createText(200,200,'Join Lobby',30)

    input3 = createInput().position(240,130)
    input3.attribute('placeholder',`enter lobby ID`)
    input3.addClass('input')
}

const joinLID=()=>{
    if(mouseX>20&&mouseX<70&&mouseY>20&&mouseY<70){
        for(let key of selectAll('input')){
            key.remove()
        }
        screen='menu'
        loop()
    }
    else if(mouseX>100&&mouseY>170&&mouseX<300&&mouseY<210){
        httpGet(`./lobby/${input3.value()}`,'json',(data)=>{
            if(data.length===0||input3.value()===''){
                createText(width/2,250,'Invalid ID',20,undefined,[255,0,0])
            }
            else{
                for(let key of selectAll('input')){
                    key.remove()
                }
                screen='lobbyWait'
                lobbyID=data[0].id
                socket.emit('lobbyJoin',lobbyID)
            }
        })
    }
}


//create lobby
const lobbySettings=()=>{
    createBack()
    createRect(250,175,410,210,undefined,[184, 141, 62],undefined,0)
    createRect(420,175,580,210,undefined,[230, 176, 78],undefined,0)
    createRect(260,225,295,260,undefined,[255,255,255])
    createRect(100,280,300,330,[25,25,25,25],[255, 47, 36],[0, 138, 9],2)
    createText(330,200,'competitive',30)
    createText(500,200,'cooperative',30)
    createText(250,100,'Create Game',50)
    createText(150,150,'Lobby Name:',30)
    createText(140,200,'Game Type:',30)
    createText(155,250,'Private Lobby:',30)
    createText(200,315,'Create Lobby',30)

    input2 = createInput().position(260,130)
    input2.attribute('placeholder',`${pName}s lobby`)
    input2.addClass('input')
}

const createLobby=()=>{
    if(mouseX>20&&mouseX<70&&mouseY>20&&mouseY<70){
        for(let key of selectAll('input')){
            key.remove()
        }
        screen='lobbySearch'
        loop()
    }
    else if(mouseX>240&&mouseX<400&&mouseY>175&&mouseY<210){
        createRect(250,175,410,210,undefined,[184, 141, 62],undefined,0)
        createRect(420,175,580,210,undefined,[230, 176, 78],undefined,0)
        createText(330,200,'competitive',30)
        createText(500,200,'cooperative',30)
        lobbyType='comp'
    }
    else if(mouseX>420&&mouseX<580&&mouseY>175&&mouseY<210){
        createRect(250,175,410,210,undefined,[230, 176, 78],undefined,0)
        createRect(420,175,580,210,undefined,[184, 141, 62],undefined,0)
        createText(330,200,'competitive',30)
        createText(500,200,'cooperative',30)
        lobbyType='coop'
    }
    else if(mouseX>260&&mouseX<295&&mouseY>225&&mouseY<260){
        switch(public){
            case false:
                createRect(260,225,295,260,undefined,[255,255,255])
                public = true
                break;
            case true:
                createText(277,253,'X',30)
                public = false
                break;
        }
    }
    else if(mouseX>100&&mouseX<300&&mouseY>280&&mouseY<330&&lobbyType==='comp'){
        let lName = ''
        input2.value()===''?
            lName=input2.attribute('placeholder'):
            lName=input2.value()
        for(let key of selectAll('input')){
            key.remove()
        }
        screen= 'lobbyWait'
        host=true
        httpPost('./lobby','json',{name:lName,type:lobbyType,public:public,player:pName})
        .then(data=>{
            console.log(data)
            lobbyID=data[0].id
            socket.emit('lobbyJoin',data[0].id)
        })
        setTimeout(()=>{loop()}, 1000);
    }
    else if(lobbyType==='coop'){
        createText(width/2,350,'coop is work in progress',20,undefined,[255,0,0])
    }
}


//lobby
const waiting=()=>{
    httpGet(`./players/${lobbyID}`,'json',(data)=>{
        console.log(data)
        for(let i=0;i<data.length&&i<9;i++){
            let refY=125+(i*75)
            createLine(50,refY,650,refY,undefined,2)
            createLine(50,refY+75,650,refY+75,undefined,2)
            createText(200,refY+50,data[i].name,20,undefined,undefined,undefined,undefined,LEFT)
            image(fruitTypes[Object.keys(fruitTypes)[i]].nextImage,57.5,refY+7.5)
        }
    })
    httpGet(`./lobby/${lobbyID}`,'json',(data)=>{
        createText(250,100,data[0].name,50)
        console.log(data[0].public===false)
        if(data[0].public===false){
            createText(width-110,60,`(private lobby)`,20,undefined,[255,0,0])
        }
    })
    createBack()
    createRect(50,125,650,875,undefined,[237, 191, 107])
    createRect(100,900,600,1000,[25,25,25,25],[255, 47, 36],[0, 138, 9],2)
    createText(600,100,`lobby ID: ${lobbyID}`,30)
    if(host===true){
        createText(350,970,'START GAME',50,undefined,[0,0,0])
    }
    else{
        createText(350,970,'waiting on host',50,undefined,[0,0,0])

    }
}

const startGame=()=>{
    if(mouseX>20&&mouseX<70&&mouseY>20&&mouseY<70){
        screen='lobbySearch'
        host=false
        socket.emit('lobbyLeave',lobbyID)
        loop()
    }
    else if(mouseX>100&&mouseY>900&&mouseX<600&&mouseY<1000&&host===true){
        screen='game'
        socket.emit('startGame',lobbyID)
        loop()
    }
}


//game
const fruitDrop=()=>{
    fruitsDropped.unshift(new droppedFruit(fruitHand.pos.x,178.75,fruitHand.type))
    fruitHand = undefined
    setTimeout(() => {fruitHand = new handyFruit(nextFruit)}, 1500);
    nextFruit=randomFruit()
}

const randomFruit=()=>{
    return Object.keys(fruitTypes)[Math.round(random(max))]
}

const fruitGame=async()=>{
    createRect(0,226.75,700,0,undefined,[3, 244, 252])
    createRect(width-125,25,width-25,125,[25,25,25,25],[179,179,179],undefined,2)
    createText(width-83,50,'next',30,'arial',[255,255,255],undefined,3)
    createText(25,60,score,50,'arial',[26,255,0],[0,60,255],10,LEFT)
    image(fruitTypes[nextFruit].nextImage,width-105,55)
    createLine(0,226.75,700,226.75)
    createText(10,210,'do not overfill',20,'arial',undefined,undefined,undefined,LEFT)
    for(let i=0;i<4&&i<otherScores.length;i++){
        createText(width/2,i*50+25,`${i}: ${otherScores[i].name} (${otherScores[i].currp} points)`,30)
    }

    if(fruitHand){
        fruitHand.show()
    }

    for(let i=fruitsDropped.length-1;i>=0;i--){
        fruitsDropped[i].show()
        if(fruitsDropped[i].pos.y-fruitsDropped[i].r<227.75){
            setTimeout(()=>{
                if(fruitsDropped[i].pos.y-fruitsDropped[i].r<227.75){
                    screen='gameEnd'
                }
            },3000)
        }
    }

    for(let i=fruitsDropped.length-1;i>=0;i--){
        for(let j=fruitsDropped.length-1;j>=0;j--){
            await fruitsDropped[i].collide(fruitsDropped[j],i,j)
        }
    }
    loop()
}


//post-game
const gameOver=()=>{
    createRect(width/2-100,height/2-230,width/2+100,height/2-190,[25,25,25,25],[255, 47, 36],[0, 138, 9],2)
    createText(width/2,height/2,'GAME\nOVER',200)
    createText(width/2,height/2-200,'Play Again',30)
    createText(width/2-50,height/2-250,`Score: ${score}`,30,undefined,undefined,undefined,undefined,undefined,LEFT)
    createText(width/2-100,height/2-300,`Place: ${place}`,30,undefined,undefined,undefined,undefined,LEFT)
}

const nextGame=()=>{
    if(mouseX>width/2-100&&mouseY>height/2-230&&mouseX<width/2+100&&mouseY<height/2-190){
        screen='menu'
        score=0
        place=0
        loop()
    }
}


//shape/element helper functions
const createRect=(x1,y1,x2,y2,[tlr,trr,brr,blr]=[0,0,0,0],[fr,fg,fb]=[0,0,0],[br,bg,bb]=[0,0,0],bWeight=1)=>{
    fill(fr,fg,fb)
    stroke(br,bg,bb)
    strokeWeight(bWeight)
    rect(x1,y1,(x2-x1),(y2-y1),tlr,trr,brr,blr)
}

const createTri=(x1,y1,x2,y2,x3,y3,[fr,fg,fb]=[0,0,0],[br,bg,bb]=[0,0,0],bWeight=0)=>{
    fill(fr,fg,fb)
    stroke(br,bg,bb)
    strokeWeight(bWeight)
    triangle(x1,y1,x2,y2,x3,y3)
}

const createText=(x1,y1,textContent,fontSize=1,fontFamily='arial',[fr,fg,fb]=[0,0,0],[br,bg,bb]=[0,0,0],bWeight=0,align=CENTER)=>{
    fill(fr,fg,fb)
    stroke(br,bg,bb)
    strokeWeight(bWeight)
    textSize(fontSize)
    textFont(fontFamily)
    textAlign(align)
    text(textContent,x1,y1)
}

const createLine=(x1,y1,x2,y2,[br,bg,bb]=[0,0,0],bWeight=1)=>{
    stroke(br,bg,bb)
    strokeWeight(bWeight)
    line(x1,y1,x2,y2)
}

const createBack=()=>{
    createRect(20,20,70,70,undefined,[207,207,207])
    createTri(25,45,55,25,55,65)
}


//socket events
socket.on('newLobby',(message)=>{
    console.log(screen==='lobbySearch')
    if(screen==='lobbySearch'){
        loop()
    }
})

socket.on('lChange',()=>{
    if(screen==='lobbyWait'){
        console.log('lChange received')
        setTimeout(() => {loop()}, 500);
    }
})

socket.on('lDelete',()=>{
    socket.emit('kickPlease',lobbyID)
    screen='lobbySearch'
    loop()
})

socket.on('startGame',(data)=>{
    otherScores=[...data]
    screen='game'
    loop()
})

socket.on('update',(data,fruit)=>{
    fruitsDropped.unshift(new droppedFruit(random(width),178.75,fruit))
    otherScores=[...data]
})