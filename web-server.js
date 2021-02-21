const http = require("http");
// const staticAlias = require("node-static-alias");
const path = require("path");
const sqlite3 = require("sqlite3");
const util = require("util");
const express = require("express");

const app = express();
const delay = util.promisify(setTimeout);
const httpServer = http.createServer(/*handleRequest*/app);
const HTTP_PORT = 8039;
const WEB_PATH = path.join(__dirname, "myapp");
const fileServer = new staticAlias.Server(WEB_PATH, {
  cache: 100,
  serverInfo: "Node server example",
  alias: [
    {
      match: /^\/(?:index\/?)?(?:[?#].*$)?$/,
      serve: "index.html",
      force: true,
    },
    {
      match: /^\/js\/.+$/,
      serve: "<% absPath %>",
      force: true,
    },
    {
      match: /^\/(?:[\w\d]+)(?:[\/?#].*$)?$/,
      serve: function onMatch(params) {
        return `${params.basename}.html`;
      },
    },
    {
      match: /[^]/,
      serve: "404.html",
    },
  ]
});
const DB_PATH = path.join(__dirname, "db", "test.db");
const DB__SCHEME_PATH = path.join(__dirname, "db", "mydb.sql");
let SQL3;


main();

function main() {
  httpServer.listen(HTTP_PORT);
  console.log("Listening on " + HTTP_PORT);

  const myDbObj = new sqlite3.Database(DB_PATH);

  SQL3 = {
    run(...args) {
      return new Promise(function c(resolve, reject) {
        myDbObj.run(...args, function onResult(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    },
    get: util.promisify(myDbObj.get.bind(myDbObj)),
    all: util.promisify(myDbObj.all.bind(myDbObj)),
    exec: util.promisify(myDbObj.exec.bind(myDbObj)),
  };

  app.get("/get-records", async (req, res) => {
    await delay(2000);
    const records = await getAllRecords();
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    });
    res.write(JSON.stringify(records));
    res.end();
  });

  app.use(function rewriteURls(req, res, next) {
    if (req.url.includes("index") || req.url === "/") {
      req.url = "/index.html";
      next();
    }
    else if (req.url.includes("about")) {
      req.url = "/about.html";
      next();
    }
    else if (req.url.includes("js")) {
      next();
    }
    else {
      req.url = "/404.html";
      next();
    }
  });

  app.use(express.static(WEB_PATH, {
    maxAge: 100,
    setHeaders: (res) => {
      res.setHeader("Server", "Node example");
    }
  }));
}

async function handleRequest(req, res) {
  if (req.url === "/get-records") {
    const records = await getAllRecords();
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    });
    res.write(JSON.stringify(records));
    res.end();
  }
  else {
    fileServer.serve(req, res);
  }
  // if (req.url == "/hello") {
  //   res.writeHead(200, { "Content-Type": "text/plain" });
  //   res.end("Hello World");
  // }
}

async function getAllRecords() {
  return await SQL3.all(
    `
          SELECT
              Something.data as 'something',
              Other.data as 'other'
          FROM
              something JOIN Other
              ON (something.otherId = other.id)
          ORDER BY
              other.id DESC, something.data ASC
      `
  );
}