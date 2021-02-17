const sqlite3 = require("sqlite3");
const path = require("path");
const fs = require("fs");
const util = require("util");

const DB_PATH = path.join(__dirname, "db", "test.db");
const DB__SCHEME_PATH = path.join(__dirname, "db", "mydb.sql");
const args = require("minimist")(process.argv.slice(2), {
    string: ["val"]
});
let SQL3;

main().catch(console.error);

async function main() {
    const myDbObj = new sqlite3.Database(DB_PATH);
    const val1 = args.val;
    const val2 = Math.trunc(Math.random() * 7705);

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

    const initSql = fs.readFileSync(DB__SCHEME_PATH, "utf-8");

    await SQL3.exec(initSql);

    console.log(val1, val2);

    const providedValueId = await insertOrLookupProvidedValue(val1);

    if(providedValueId){
        const newValInsertionResult = await insertNewValue(providedValueId, val2);
        if(newValInsertionResult){
             console.table(await getAllRecords());
             return;
        }
    }

    Promise.reject("Error occurred");
}

async function insertOrLookupProvidedValue(val) {
  const result = await SQL3.get(
    `
            SELECT 
                id
            FROM
                OTHER
            WHERE
                data = ?
        `,
    val
  );

  if(result && result.id){
      return result.id;
  }

  const insertedResult = await SQL3.run(
    `
      INSERT INTO
          Other (data)
      VALUES
          (?) 
  `, val
);

  return insertedResult && insertedResult.lastID;
};

async function insertNewValue(refId, val){
    const insertedResult = await SQL3.run(
        `
          INSERT INTO
              Something (otherID, data)
          VALUES
          (?, ?)
      `, refId, val
    );

    return insertedResult && insertedResult.changes > 0;
};

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