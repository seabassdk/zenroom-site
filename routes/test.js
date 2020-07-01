const router = require('express').Router();
// import { promises as fs } from 'fs';
const { promises:fs } = require('fs');
const { parse, relative, resolve } = require('path');

router.get('/', async (req, res) => {
    console.log('testing');
    const paths = await ls();
    console.log('Paths: ');
    console.log(paths);
    res.send({ "msg": "ok!" })
})

const ZENCODE_DIR = './zencode';
console.log('Directory: ' + ZENCODE_DIR)

async function* getFiles(rootPath) {
    console.log('running method: getFiles');
    const fileNames = await fs.readdir(rootPath);
    console.log('Getting files from path...');
    console.log(fileNames);
    for (const fileName of fileNames) {
        const path = resolve(rootPath, fileName);
        if ((await fs.stat(path)).isDirectory()) {
            yield* getFiles(path);
        } else {
            yield path;
        }
    }
}

function forAwait(asyncIter, f) {
    console.log('running method: forAwait');
    asyncIter.next().then(({ done, value }) => {
        if (done) return;
        f(value);
        forAwait(asyncIter, f);
    });
}

/**
 * Reads the directory and list all the files
 * into an object with the full path
 * @returns {object}
 */
const ls = async () => {
    console.log('running method: ls');
    const files = {};
    forAwait(getFiles(ZENCODE_DIR), item => {
        const p = relative(ZENCODE_DIR, item).split(".")[0]
        files[`${p}`] = item;
    })
    return files;
};

module.exports = router;
