const http = require("http");
const staticAlias = require("node-static-alias");

const httpServer = http.createServer(handleRequest);
const HTTP_PORT = 8039;

main();

function main(){
    httpServer.listen(HTTP_PORT);
    console.log("Listening on " + HTTP_PORT);
}

async function handleRequest(req, res) {
  if (req.url == "/hello") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World");
  }
}