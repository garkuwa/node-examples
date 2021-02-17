const path = require("path");
const fs = require("fs");
const Transform = require("stream").Transform;
const zlib = require("zlib");
const sqlite3 = require("sqlite3");

const zipFileName = path.resolve("gzipFile.txt.gz");
const operationTimeout = 2000;

const upperStreamTransformer = new Transform({
    transform(chunk, encoding, cb) {
        this.push(chunk.toString().toUpperCase());
        cb();
    }
})

processFile(
    fs.createReadStream(path.resolve(process.argv[process.argv.length - 1])),
    upperStreamTransformer,
    zlib.createGzip(),
    fs.createWriteStream(zipFileName)
).then(() => {
    console.log("unzipping will start...");
    processFile(
        fs.createReadStream(zipFileName),
        null,
        zlib.createGunzip(),
        process.stdout
    )
        .then(() => console.log("\nCompleted"))
        .catch((res) => console.log(res));
});


async function processFile(streamIn, transformer, gZipping, streamOut) {
    const gZippedOutStream = (transformer ? streamIn.pipe(transformer) : streamIn)
        .pipe(gZipping)

    gZippedOutStream
        .pipe(streamOut);

    return new Promise((res, rej) => {
        if (!transformer) {
            setTimeout(() => {
                gZippedOutStream.unpipe();
                gZippedOutStream.destroy();
                rej("Took too long");
            }, operationTimeout)
        }
        gZippedOutStream.on("end", res);
    });
}
