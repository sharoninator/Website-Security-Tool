const express = require('express')
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const app = express()
const port = 3000

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function defaultCreds() {
  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });
    if (!response.ok) {
      return `Error: ${response.statusText}`;
    }
    const result = await response.text();
    return result;
  } catch (error) {
    return `Request failed: ${error.message}`;
  }
}

async function pathTraversal() {
  try {
    const response = await fetch('http://localhost:3000/pathtraversal/..%2F..%2F..%2Fsecret.txt');
    if (!response.ok) {
      return `Error: ${response.statusText}`;
    }
    const result = await response.text();
    return result;
  } catch (error) {
    return `Request failed: ${error.message}`;
  }
}

app.post('/exploit', async (req, res) => {
  let { exploitType } = req.body;
  try {
    if (exploitType === "Path Traversal") {
      let result = await pathTraversal();
      res.send(result);
    } else if (exploitType === "Default Credentials") {
      let result = await defaultCreds();
      res.send(result);
    } else {
      res.send("Strange server error. This exploit doesnt exist.")
    }
  } catch (error) {
    res.send(`Request from server failed: ${error.message}`);
  }

});

app.get('/pathtraversal', (req, res) => {
  res.send("Path traversal vulnerability example. Try to add ..%2F to the url and read a file. Can you read /etc/passwd?")
})

app.get('/pathtraversal/*', (req, res) => {
  let filePath = path.resolve(__dirname + req.params[0]);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.send("File at " + filePath + " doesn't exist.");
  }
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  let { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'failed.html'));
  }
});

app.listen(port, () => {
  console.log(`Fully Secure app listening on port ${port}`)
})