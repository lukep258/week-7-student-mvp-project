fetch('./assets/legend.png')
.then(response=>response.blob())
.then(blob=>{
    const imgURL=URL.createObjectURL(blob)
    const image=document.createElement('img')
    image.src=imgURL
    const container = document.getElementsByTagName('body')[0]
    container.append(image) 
})