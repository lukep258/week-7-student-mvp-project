
var fruitTypes = {
    cherry:{
        weight:2,
        size:50
    },
    strawberry:{
        weight:4,
        size:80
    },
    grape:6,
    tangerine:8,
    orange:12,
    apple:12,
    pear:14,
    peach:16,
    pineapple:18,
    melon:20,
    watermelon:22,
    max:0
}
var fruitHand = {}
var fruitsDropped = []

function preload(){
    fruitTypes.cherry.image=loadImage('../assets/cherry.png')
}

function setup(){
    createCanvas(700,1050)
    fruitTypes.cherry.image.resize(fruitTypes.cherry.size,fruitTypes.cherry.size)
    fruitHand=new handyFruit(randomFruit())
    // for(var i=0;i<10;i++){
    //     fruits[i]=new fruit(random(width),random(height))
    //     fruits[i].show()
    // }
}

function draw(){
    background(230, 176, 78)
    fruitHand.update()
    fruitHand.show()
    for(let i=fruitsDropped.length-1;i>=0;i--){
        fruitsDropped[i].show()
        fruitsDropped[i].fall()
        // if(fruitsDropped.eats(fruitsDropped[i])){
        //     fruitsDropped.splice(i,1)
        // }
    }
    for(let i=fruitsDropped.length-1;i>=0;i--){
        for(let j=fruitsDropped.length-1;j>=0;j--){
            fruitsDropped[i].collide(fruitsDropped[j])
        }
    }
}

function mouseClicked(){
    fruitsDropped.push(new droppedFruit(fruitHand.pos.x,fruitHand.type))
    fruitHand = new handyFruit(randomFruit())
}

function handyFruit(type){
    this.type=type
    this.typeObj={...fruitTypes[type]}
    this.pos=createVector(0,78.75)
    this.r=this.typeObj.size/2

    this.show=function(){
        image(this.typeObj.image,this.pos.x-this.r,this.pos.y)
    }

    this.update=function(){
        var mouse = createVector(mouseX,this.pos.y)
        mouse.sub(this.pos)
        this.pos.add(mouse)
    }
}

function droppedFruit(x,type){
    this.type=type
    this.typeObj={...fruitTypes[type]}
    this.pos=createVector(x,78.75)
    this.r=this.typeObj.size/2
    this.v=createVector(0,3)

    this.show=function(){
        image(this.typeObj.image,this.pos.x-this.r,this.pos.y)
    }

    this.fall=function(){
        // var d=p5.Vector.dis(this.pos,other.pos)
        this.v.y+=1
        this.pos.add(this.v)
        if(this.pos.x<this.r){
            this.pos.x=this.r
            this.v.x=-this.r.x*0.2
        }
        if(this.pos.x>width-this.r){
            this.pos.x=width-this.r
            this.v.x=-this.v.x*0.2
        }
        if(this.pos.y<this.r){
            this.pos.y=this.r
            this.v.y=-this.v.y
        }
        if(this.pos.y>height-this.r){
            this.pos.y=height-this.r
            this.v.y=-this.v.y*0.2
        }
    }

    this.collide=function(other){
        if(other==this){
            return
        }
        let dVector=p5.Vector.sub(other.pos,this.pos)
        let d = dVector.mag()-(this.r+other.r)
        if(d<1){
            let weightRatio=this.typeObj.weight/(this.typeObj.weight+other.typeObj.weight)
            let thisDisp=dVector.copy().setMag(abs(d*weightRatio))
            let otherDisp=dVector.copy().setMag(abs(d*(1-weightRatio)))
            this.pos.sub(thisDisp)
            other.pos.add(otherDisp)
            let dVectorNormal=dVector.copy().normalize()
            let approachSpeed=this.v.dot(dVectorNormal)+-other.v.dot(dVectorNormal)
            let approachVector=dVectorNormal.copy().setMag(approachSpeed*0.3)
            this.v.sub(approachVector)
            other.v.add(approachVector)
        }
    }
    // this.eats = function(other){
    //     var d=p5.Vector.dist(this.pos,other.pos)
    //     if (d<this.r+other.r){
    //         return true;
    //     }
    //     else{
    //         return false;
    //     }
    // }
}

const randomFruit=()=>{
    return Object.keys(fruitTypes)[random(fruitTypes.max)]
}