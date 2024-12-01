const response_output = document.getElementById("response-output");
const vulnerableCode = document.getElementById("vulnerable-code");
const secureCode = document.getElementById("secure-code");
const exploitSelect = document.getElementById("exploit-select");
const attackCode = document.getElementById("attack-code");
const iframe = document.getElementById("exploit-iframe")

const exploitData = {

  "Path Traversal": {
    vulnerable_url: "http://localhost/pathtraversal",
    secure_url: "http://localhost/pathtraversal",
    vulnerable: `let filePath = path.resolve(__dirname + req.params[0]);
if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
} else {
    res.send("File at " + filePath + " doesn't exist.");
}`,
    secure: `Secure version not yet implemented`,
    exploit_request: "http://localhost:3000/pathtraversal/..%2F..%2F..%2Fsecret.txt",
    documentation_html_filepath: "pathtraversal.html"
  }
}

function updateCode() {
  const selectedExploit = exploitSelect.value;
  const exploit = exploitData[selectedExploit];
  vulnerableCode.textContent = exploit.vulnerable;
  secureCode.textContent = exploit.secure;
  attackCode.textContent = exploit.exploit_request
}


async function sendExploit() {
  try {
    const selectedExploit = exploitSelect.value;
    const exploit = exploitData[selectedExploit];
    const exploitRequestUrl = exploit.exploit_request;
    iframe.src = exploit.exploit_request;

    const response = await fetch(exploitRequestUrl);

    const result = await response.text();

    response_output.innerHTML = result;

  } catch (error) {
    response_output.innerHTML = "ERROR";
  }
}



exploitSelect.addEventListener("change", updateCode);
updateCode();
