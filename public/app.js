fetch('/test')
.then(response=>response.json())
.then(data=>console.log(data,'app.js test'))