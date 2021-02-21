const util = require("util");
const childProc = require("child_process");
const PROCESSES_COUNT = 5;
const delay = util.promisify(setTimeout);

main().catch(() => console.log("Opps"));

async function main() {
    let processes, success;
    while (true) {
        process.stdout.write(`Starting ${PROCESSES_COUNT} child processes`);
        processes = [];
        for (let i = 0; i <= PROCESSES_COUNT; i++) {
            processes.push(
                promisifyChildProc(
                    childProc.spawn("node", ["child-process.js"])
                )
            );
        }
        success = await Promise.all(processes).then((codes) => codes.every(code => code === 0));

        console.log(success);
        if (success) {
            console.log("Success!");
            return;
        }
        console.log("Retrying!");
        delay(5000);
    }
}

function promisifyChildProc(process) {
    return new Promise((res, rej) => {
        process.addListener("error", rej);
        process.addListener("exit", res);
    })
}
