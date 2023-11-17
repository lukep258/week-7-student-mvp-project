
var fruitTypes = {
    cherry:{
        points:2,
        size:52.5
    },
    strawberry:4,
    grape:6,
    tangerine:8,
    orange:12,
    apple:12,
    pear:14,
    peach:16,
    pineapple:18,
    melon:20,
    watermelon:22
}
var fruitHand = {}
var fruitsDropped = []

function preload(){
    fruitTypes.cherry.image=loadImage('../assets/cherry.png')
}

function setup(){
    createCanvas(700,1050)
    fruitTypes.cherry.image.resize(fruitTypes.cherry.size,fruitTypes.cherry.size)
    fruitHand=new handyFruit('cherry')
    // for(var i=0;i<10;i++){
    //     fruits[i]=new fruit(random(width),random(height))
    //     fruits[i].show()
    // }
}

function draw(){
    background(230, 176, 78)
    fruitHand.update()
    fruitHand.show()
    for(var i=fruitsDropped.length-1;i>=0;i--){
        fruitsDropped[i].show()
        if(fruitsDropped.eats(fruitsDropped[i])){
            fruitsDropped.splice(i,1)
        }
    }
}

function mouseClicked(){
    fruitsDropped.push(new droppedFruit(fruitHand.pos.x,fruitHand.type))
    fruitHand = new handyFruit('cherry')
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
    this.typeObj={...fruitTypes[fruitType]}
    this.pos=createVector(0,78.75)
    this.r=this.typeObj.size/2

    this.show=function(other){
        image(this.typeObj.image,this.pos.x-this.r,this.pos.y)
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
