const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const https = require("https");

let request = https.get('https://ifconfig.me', (res) => {
  if (res.statusCode !== 200) {
    console.error(`Did not get an OK from the server. Code: ${res.statusCode}`);
    res.resume();
    return;
  }

  let data = 'IFCONFIG.ME Response: ';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('close', () => {
    console.log('Retrieved all data');
    console.log(data);
  });
});

require("./yb-sample")

app.get(["/", "/:name"], (req, res) => {
  greeting = "<h1>Hello From Node on Fly!</h1>";
  let name = req.params["name"];
  if (name) {
    res.send(greeting + "</br>and hello to " + name);
  } else {
    res.send(greeting);
  }
});

app.listen(port, () => console.log(`HelloNode app listening on port ${port}!`))

