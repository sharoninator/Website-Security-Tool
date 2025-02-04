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
    url: "http://localhost:3000/login",
    secure: `Secure version not yet implemented`,
    successful_substring: "Login Successful!",
    attack_request: `await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });`,
    server_side_exploit: true,
    documentation_html_filepath: "pathtraversal.html"
  },
  "Insecure Design": {
    vulnerable: `Not yet implemented`,
    url: "http://localhost:3000/bank",
    secure: `Secure version not yet implemented`,
    successful_substring: "secret",
    attack_request: "???",
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
    url: "http://localhost:3000/pathtraversal",
    secure: `Secure version not yet implemented`,
    successful_substring: "secret",
    attack_request: "http://localhost:3000/pathtraversal/..%2F..%2F..%2Fsecret.txt",
    server_side_exploit: true,
    documentation_html_filepath: "placeholder.html"
  }
}

function updateCode() {
  const selectedExploit = exploitSelect.value;
  const exploit = exploitData[selectedExploit];
  vulnerableCode.textContent = exploit.vulnerable;
  secureCode.textContent = exploit.secure;
  attackRequest.textContent = exploit.attack_request
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
        console.log("Response body:", result);

        // https://stackoverflow.com/questions/8240101/set-content-of-iframe
        iframe.src = "about:blank";
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(result);
        iframe.contentWindow.document.close();
        if (result.includes(exploitData[selectedExploit].successful_substring)) {
          response_output.innerHTML = "The attack was successful!";
        } else {
          response_output.innerHTML = "The exploit failed.";
        }
      } else {
        console.log("Error:", response.status, response.statusText);
      }
    } else { // the exploit is to be sent from the iframe.

      console.log("Executing in iframe " + exploitData[selectedExploit].attack_request)
      iframe.contentWindow.eval(exploitData[selectedExploit].attack_request);
      result = iframe.contentWindow.document.body.innerText;

      const checkInterval = 50;
      const timeout = 5000;
      let elapsedTime = 0;

      const intervalId = setInterval(() => {
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

exploitSelect.addEventListener("change", updateCode);

addExploitOptions();
updateCode();
