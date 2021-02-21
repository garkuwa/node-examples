const util = require("util");
const childProc = require("child_process");
const PROCESSES_COUNT = 5;
const delay = util.promisify(setTimeout);

main().catch(()=> console.log("Opps"));

async function main(){
    let processes, success;
    while(true){
        process.stdout.write(`Starting ${PROCESSES_COUNT} child processes`);
        processes = [];
        for(let i = 0; i <= PROCESSES_COUNT; i++){
            processes.push(
                util.promisify(childProc.spawn("node", ["child-process.js"]).on)("exit")
            );
        }
        success = await Promise.all(processes).then((values) => {
            console.log(values);
            return values.every(val => val.code === 0);
        });

        console.log(success);
        if(success){
            console.log("Success!");
            return;
        }
        console.log("Retrying!");
        delay(5000);
    }
     //const child = util.promisify(childProc.spawn("node", ["child-process.js"]).on);

    // child.on("exit", (code) => console.log("Child has ended", code));
}
