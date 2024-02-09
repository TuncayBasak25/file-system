const { Folder } = require("./dist");

async function main() {
    const root = await Folder.open(__dirname);

    const testFolder = await root.openFolder("test");

    await testFolder.openFolder("cast")

    const files = await testFolder.files;

    const dFile = files.d;

    dFile.watcher.addListener("change", (eventType, data) => {
        console.log(eventType, data);
    })

}

main();