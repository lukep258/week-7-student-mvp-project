
var blob
var blobs = []

function setup(){
    createCanvas(600,600)
    blob = new Blob(width/2,height/2,64)
    for(var i=0;i<10;i++){
        blobs[i]=new Blob(random(width),random(height),16)
        blobs[i].show()
    }
}

function draw(){
    background(0)
    blob.update()
    blob.show()
    for(var i=blobs.length-1;i>=0;i--){
        blobs[i].show()
        if(blob.eats(blobs[i])){
            blobs.splice(i,1)
        }
    }
}

function Blob(x,y,r){
    this.pos=createVector(x,y)
    this.r=r
    
    this.show=function(){
        fill(255)
        ellipse(this.pos.x,this.pos.y,this.r*2,this.r*2)
    }

    this.update=function(){
        var mouse = createVector(mouseX,mouseY)
        mouse.sub(this.pos)
        // mouse.setMag(3)
        this.pos.add(mouse)
    }

    this.eats = function(other){
        var d=p5.Vector.dist(this.pos,other.pos)
        if (d<this.r+other.r){
            this.r += other.r;
            return true;
        }
        else{
            return false;
        }
    }
}
