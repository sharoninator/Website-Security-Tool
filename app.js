import fetch from 'node-fetch';
import express from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

const app = express()
const port = 3001

let accounts;

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// helper functions for get and post requests
async function postReq(url, data) {
  try {
    console.log(data)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
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

async function getReq(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return `Error: ${response.statusText}`;
    }
    const result = await response.text();
    return result;
  } catch (error) {
    return `Request failed: ${error.message}`;
  }
}


async function defaultCreds(url) {
  return postReq(url, {
    username: 'admin',
    password: 'admin',
  });
}

app.get('/textreader', (req, res) => {
  let fileName = req.query.fileName;
  let infoString;
  let fileContent = "Select a text file to read it."
  let filePath = path.resolve(__dirname + "/" + fileName);
  // console.log(req.query)
  console.log("PATH: " + filePath);
  if(fileName){ // if the user gave a filepath, update filecontents and infostring.
  console.log(filePath);
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) { // check that file exists and is a file
  console.log("Trying to read " + filePath)

  infoString = "Contents of " + filePath + ":";
  fileContent = fs.readFileSync(filePath, 'utf8')

  } else {
    fileContent = "File at " + filePath + " doesn't exist."
  }
}
  res.render('textreader', { fileContent, infoString });

})

app.get('/securetextreader', (req, res) => {
  let fileName = req.query.fileName;
  let infoString;
  let fileContent = "Select a text file to read it."
  let filePath = path.resolve(__dirname + "/" + fileName);
  
  console.log("PATH: " + filePath);
  let validFiles = ["text1.txt", "text2.txt", "text3.txt"]
  if(fileName in validFiles){ // if the user gave a valid filepath, update filecontents and infostring.
  console.log(filePath);
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) { // check that file exists and is a file
    console.log("Trying to read " + filePath)

    infoString = "Contents of " + filePath + ":";
    fileContent = fs.readFileSync(filePath, 'utf8')

  } else {
    fileContent = "File at " + filePath + " doesn't exist."
  }
}
  res.render('textreader', { fileContent, infoString });

})

app.post('/exploit', async (req, res) => {
  const { exploitType, url } = req.body;
  try {
    if (exploitType === "Default Credentials") {
      let result = await defaultCreds(url);
      res.send(result);
    } else if (exploitType === "Software and Data Integrity Failures") {
      let result = await productTampering();
      res.send(result);
    } else {
      res.send("Strange server error. This exploit doesnt exist.")
    }
  } catch (error) {
    res.send(`Request from server failed: ${error.message}`);
  }

});

app.get('/bank', (req, res) => {
  accounts = { // reset user accounts on refresh
    l33th4x0r: 950,
    john: 5500,
    gary: 2000,
    wendy: 1250,
  };
  res.sendFile(path.join(__dirname, 'public', 'bank.html'));
});

app.post('/bank', (req, res) => {
  let { recipient, amount } = req.body;
  amount = parseInt(amount);
  if (typeof amount === 'number') {
    if (amount > accounts.l33th4x0r) {
      amount = accounts.l33th4x0r;
    }
    accounts.l33th4x0r -= amount;
    accounts[recipient] += amount;
    res.json({ accountInfo: accounts, amountDeducted: amount });
  }
  else {
    res.send("Invalid data")
  }
});

app.get('/securebank', (req, res) => {
  accounts = { // reset user accounts on refresh
    l33th4x0r: 950,
    john: 5500,
    gary: 2000,
    wendy: 1250,
  };
  res.sendFile(path.join(__dirname, 'public', 'securebank.html'));
});

app.post('/securebank', (req, res) => {
  let { recipient, amount } = req.body;
  amount = parseInt(amount);
  if (typeof amount === 'number') {
    if (amount > accounts.l33th4x0r) {
      amount = accounts.l33th4x0r;
    } else if(amount < 1){
      res.json({error: "You can't send a negative amount of money!!! nice try hackerman."})
      return;
    } else {
    accounts.l33th4x0r -= amount;
    accounts[recipient] += amount;
    res.json({ accountInfo: accounts, amountDeducted: amount });
  }
  }
  else {
    res.json({error: "Invalid data"})
  }
});


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



app.get('/securelogin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'securelogin.html'));
});

/*
hash.txt consists of:
const password = 'VerySecurePassword123';
const hash = bcrypt.hashSync(password, 12);
*/
const storedHash = fs.readFileSync('hash.txt', 'utf8');

app.post('/securelogin', async (req, res) => {
  let { username, password } = req.body;
  if (username === 'admin' && await bcrypt.compare(password, storedHash)) {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'securefailed.html'));
  }
});

app.listen(port, () => {
  console.log(`Fully Secure app listening on port ${port}`)
})