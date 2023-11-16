fetch('http://127.0.0.1:3000/test')
.then(response=>response.json())
.then(data=>console.log(data))