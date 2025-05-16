const response_output = document.getElementById("response-output");
const vulnerableCode = document.getElementById("vulnerable-code");
const secureCode = document.getElementById("secure-code");
const exploitSelect = document.getElementById("exploit-select");
const attackRequest = document.getElementById("attack-code");
const iframe = document.getElementById("exploit-iframe");
const urlbar = document.getElementById("url-bar");
const toggle = document.getElementById("toggle-mode-btn");
let secureMode = false;

const exploitData = {
  "Default Credentials": {
    vulnerable: `  let { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'failed.html'));
  }`,
    url: "http://localhost:3001/login",
    secureUrl: "http://localhost:3001/securelogin",
    secure: `const storedHash = fs.readFileSync('hash.txt', 'utf8');
  let { username, password } = req.body;
  if (username === 'admin' && await bcrypt.compare(password, storedHash)) {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'securefailed.html'));
  }`,
    successful_substring: "Login Successful!",
    attack_request: `await fetch('URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ username: 'admin', password: 'admin' }),
});`,
    custom_behavior: false,
    server_side_exploit: true,
    documentation: `The server allows anyone to log in using hardcoded admin credentials (admin/admin), which are often left unchanged in production.

This is dangerous because attackers can guess these easily and gain full access to resources that should only be accessible by the Admins.

Vulnerability Fix: Store passwords as bcrypt hashes and validate using bcrypt.compare.

More info:
https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/
https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html`
  },
  "Insecure Design": {
    vulnerable: `  let { recipient, amount } = req.body;
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
  }`,
    url: "http://localhost:3001/bank",
    secureUrl: "http://localhost:3001/securebank",
    secure: `  let { recipient, amount } = req.body;
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
  }`,
    successful_substring: "-$-5000",
    attack_request: `document.getElementById('amount').value = '-5000';
document.getElementById('recipient').value = 'john';
document.querySelector('button').click();`,
    server_side_exploit: false,
    documentation: `The system does not prevent users from entering negative values or invalid inputs, allowing fund theft or logic abuse.

This reflects a broader design flaw where key logic rules are missing or weak.

Vulnerability Fix: Add input validation and enforce application constraints (for example: amount > 0).

More info:
https://owasp.org/Top10/A04_2021-Insecure_Design/
https://top10proactive.owasp.org/`
  },
  "Path Traversal": {
    vulnerable: `let filePath = path.resolve(__dirname + req.params[0]);
      if (fs.existsSync(filePath)) {
          res.sendFile(filePath);
      } else {
          res.send("File at " + filePath + " doesn't exist.");
      }`,
    url: "http://localhost:3001/textreader",
    secureUrl: "http://localhost:3001/securetextreader",
    secure: `  let fileName = req.query.fileName;
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

`,
    successful_substring: "secret",
    attack_request: "window.location.href = 'URL?fileName=app.js'",
    custom_behavior: true,
    server_side_exploit: false,
    documentation: `The app directly uses user input to build file paths, which allows attackers to access unauthorized files like app.js or other directories by using ../.

Fix: Restrict input to a known safe list of filenames and avoid appending paths directly.

More info:
https://owasp.org/www-community/attacks/Path_Traversal`
  },
  "Software and Data Integrity Failures": {
    vulnerable: `??????????????`,
    url: "http://localhost:3000/#/search?q=advanced",
    secure: `Secure version not yet implemented`,
    successful_substring: "secret",
    attack_request: "????????",
    custom_behavior: true,
    server_side_exploit: true,
    documentation: "placeholder.html"
  },
  "Security Logging and Monitoring Failures": {
    vulnerable: `??????????????`,
    url: "http://localhost:3000/rest/products/search?q=",
    secure: `Secure version not yet implemented`,
    successful_substring: "secret",
    attack_request: "window.location.href = 'http://localhost:3000/rest/products/search?q=%27))%20union%20select%20id,email,password,4,5,6,7,8,9%20from%20users--'",
    custom_behavior: true,
    server_side_exploit: false,
    documentation: "placeholder.html"
  }
}

function updateCode() {
  const selectedExploit = exploitSelect.value;
  localStorage.setItem('selectedExploit', selectedExploit);

  const exploit = exploitData[selectedExploit];
  vulnerableCode.textContent = exploit.vulnerable;
  secureCode.textContent = exploit.secure;


  document.getElementById("docs").textContent = exploit.documentation
  response_output.innerHTML = "Was the exploit successful?";

  let baseUrl;

  if (secureMode) {
    baseUrl = exploit.secureUrl;
  } else {
    baseUrl = exploit.url;
  }

  
  attackRequest.textContent = exploit.attack_request.replace('URL', baseUrl);
  iframe.src = baseUrl;
  urlbar.value = baseUrl;

}


async function sendExploit() {
  try {
    let selectedExploit = exploitSelect.value;
    const exploit = exploitData[selectedExploit];
    let exploitUrl;

    if (secureMode) {
      exploitUrl = exploit.secureUrl;
    } else {
      exploitUrl = exploit.url;
    }
    if (exploitData[selectedExploit].server_side_exploit == true) { // the exploit is to be sent from the server, and the iframe will be overwritten with the response

      
      const response = await fetch('/exploit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ exploitType: selectedExploit, url: exploitUrl })
      });
      if (response.ok) {
        const result = await response.text();

        if (exploitData[selectedExploit].custom_behavior == true) {
          if (selectedExploit == "Software and Data Integrity Failures") {
            location.reload()
          }
        } else {
          // https://stackoverflow.com/questions/8240101/set-content-of-iframe
          iframe.src = 'about:blank';
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(result);
            iframe.contentWindow.document.close();
          console.log("Response body:", result);

        }
        if (result.includes(exploitData[selectedExploit].successful_substring)) {
          response_output.innerHTML = "The attack was successful!";
        } else {
          response_output.innerHTML = "The exploit failed.";
        }
      } else {
        console.log("Error:", response.status, response.statusText);
      }
    } else { // the exploit is to be sent from the iframe.
      if (exploitData[selectedExploit].custom_behavior == true) {
        if (selectedExploit == "Security Logging and Monitoring Failures") {
          let url = 'http://localhost:3000/rest/products/search?q=%27))%20union%20select%20id,email,password,4,5,6,7,8,9%20from%20users--'
          urlbar.value = url
          iframe.src = url
        } if(selectedExploit == "Path Traversal"){
        urlbar.value = exploitUrl + "?fileName=app.js"
        }
      }
      let attackRequest = exploitData[selectedExploit].attack_request.replace('URL', exploitUrl);
      
      console.log("Executing in iframe " + attackRequest)
      iframe.contentWindow.eval(attackRequest);
      result = iframe.contentWindow.document.body.innerText;

      const checkInterval = 500;
      const timeout = 5000;
      let elapsedTime = 0;

      const intervalId = setTimeout(() => {
        const result = iframe.contentWindow.document.body.innerText;
        if (result.includes(exploitData[selectedExploit].successful_substring)) {
          clearInterval(intervalId);
          response_output.innerHTML = "The attack was successful!";
        } else if (elapsedTime >= timeout) {
          clearInterval(intervalId);
          response_output.innerHTML = "The exploit failed.";
        }

        elapsedTime += checkInterval;
      }, checkInterval);
    }
  } catch (error) {
    response_output.innerHTML = "Error: " + error;
  }
}


function addExploitOptions() {
  selectElement = document.getElementById("exploit-select")
  for (let key of Object.keys(exploitData)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    selectElement.appendChild(option);
  }
}
addExploitOptions();


const savedExploit = localStorage.getItem('selectedExploit');
if (savedExploit != null) {
  exploitSelect.value = savedExploit;
} else {
  exploitSelect.value = Object.keys(exploitData)[0];
  localStorage.setItem('selectedExploit', exploitSelect.value);
}

urlbar.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    iframe.src = urlbar.value;
  }
});


toggle.addEventListener("click", () => {
  secureMode = !secureMode;

  if (secureMode) {
    toggle.textContent = "Toggle Insecure Mode";
  } else {
    toggle.textContent = "Toggle Secure Mode";
  }

  updateCode();
});




exploitSelect.addEventListener("change", updateCode);

document.addEventListener("DOMContentLoaded", updateCode )

// updateCode()