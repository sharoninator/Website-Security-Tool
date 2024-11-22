const express = require('express')
const fs = require('fs');
const path = require('path');
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello, welcome to my secure web application! dont test it, its fully secure i swear!')
})

app.get('/pathtraversal', (req, res) => {
  res.send("Path traversal vulnerability example. Try to add ..%2F to the url and read a file. Can you read /etc/passwd?")
})

app.get('/pathtraversal/*', (req, res) => {
  let filePath = path.resolve(__dirname + req.params[0]);
  if(fs.existsSync(filePath)){
    res.sendFile(filePath);
  }else {
    res.send("File at " + filePath + " doesn't exist.");
  }
})


app.get('/login', (req, res) => {
  let { username, password } = req.query;
  if (username === 'admin' && password === 'admin') {
    res.send('Successful login to admin account.');
  } else {
    res.send('Login failed. Invalid username or password.');
  }
});

app.listen(port, () => {
  console.log(`Fully Secure app listening on port ${port}`)
})