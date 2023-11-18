
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
let max = 0
let screen = 'menu'
var nextFruit = {}
var fruitHand = {}
var fruitsDropped = []
var score = 0


function preload(){
    for(let key in fruitTypes){
        fruitTypes[key].image=loadImage(`../assets/${key}.png`)
        fruitTypes[key].nextImage=loadImage(`../assets/${key}.png`)
    }
}


function setup(){
    createCanvas(700,1150)
    for(let key in fruitTypes){
        fruitTypes[key].image.resize(fruitTypes[key].size,fruitTypes[key].size)
        fruitTypes[key].nextImage.resize(60,60)
    }
    fruitHand=new handyFruit(randomFruit())
    nextFruit=randomFruit()
}


async function draw(){    
    background(230, 176, 78)
    switch(screen){
        case 'menu':
            menu()
            break;
        case 'lobbySearch':
            break;
        case 'lobbyCreate':
            break;
        case 'lobbyWait':
            break;
        case 'game':
            await fruitGame()
            break;
    }
}


function mouseClicked(){
    switch(screen){
        case 'menu':
            menuSelect()
            break;
        case 'lobbySearch':
            break;
        case 'lobbyCreate':
            break;
        case 'lobbyWait':
            break;
        case 'game':
            fruitDrop()
            break;
    }
}


function handyFruit(type){
    this.type=type
    this.typeObj={...fruitTypes[type]}
    this.pos=createVector(mouseX,178.75)
    this.r=this.typeObj.size/2

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
            fruitsDropped.unshift(new droppedFruit(middle[0],middle[1],fruitTypeArr[typeIndex+1]))
            console.log(fruitsDropped,score)
        }
    }
}

const randomFruit=()=>{
    return Object.keys(fruitTypes)[Math.round(random(max))]
}

const menu=()=>{
    text('Suika Multiplayer',width/2-40,height/2-80)
    textSize()
    const search = rect(width/2-100,height/2-40,200,80,25,25,25,25)
    const join = rect(width/2-100,height/2+80,200,80,25,25,25,25)
    join.fill(100)
}

const fruitDrop=()=>{
    fruitsDropped.push(new droppedFruit(fruitHand.pos.x,178.75,fruitHand.type))
    fruitHand = undefined
    setTimeout(() => {fruitHand = new handyFruit(nextFruit)}, 1000);
    nextFruit=randomFruit()
}

const fruitGame=async ()=>{
    fill(179, 179, 179)
    strokeWeight(2)
    stroke(0)
    rect(width-125,25,100,100,25,25,25,25)
    textSize(30)
    fill(255)
    stroke(0)
    strokeWeight(3)
    text('next',width-113,50)
    textSize(50)
    fill(26, 255, 0)
    stroke(0, 60, 255)
    strokeWeight(10)
    textFont('arial')
    text(score,25,60)
    image(fruitTypes[nextFruit].nextImage,width-105,55)
    if(fruitHand){
        fruitHand.show()
    }
    for(let i=fruitsDropped.length-1;i>=0;i--){
        fruitsDropped[i].show()
    }
    for(let i=fruitsDropped.length-1;i>=0;i--){
        for(let j=fruitsDropped.length-1;j>=0;j--){
            await fruitsDropped[i].collide(fruitsDropped[j],i,j)
        }
    }
}