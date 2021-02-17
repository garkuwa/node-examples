const sqlite3 = require("sqlite3");
const path = require("path");
const fs = require("fs");
const util = require("util");

const DB_PATH = path.join(__dirname, "db", "test.db");
const DB__SCHEME_PATH = path.join(__dirname, "db", "mydb.sql");
let SQL3;

main().catch(console.error);

async function main() {
    const myDbObj = new sqlite3.Database(DB_PATH);
    const val2 = Math.trunc(Math.random() * 7705);

    SQL3 = {
        run(...args) {
            return new Promise(function c(resolve, reject) {
                myDB.run(...args, function onResult(err) {
                    if (err) reject(err);
                    else resolve(this);
                });
            });
        },
        get: util.promisify(myDbObj.get.bind(myDbObj)),
        all: util.promisify(myDbObj.all.bind(myDbObj)),
        exec: util.promisify(myDbObj.exec.bind(myDbObj)),
    };

    const initSql = fs.readFileSync(DB__SCHEME_PATH, "utf-8");

    await SQL3.exec(initSql);

    console.log(process.argv[2], val2);
}