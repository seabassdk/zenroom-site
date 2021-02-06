import express from 'express';
import fs from 'fs';
import verify from '../validation/verifyToken.js';

const router = express.Router({ mergeParams: true });

const contractDir = process.env.ZENCODE_DIR + '/';

router.post('/', verify, (req, res) => {
    const contractFiles = [];
    try {
        let zencode;
        let keys;
        let config;
        const contractsDir = contractDir + req.body.username + '/';
        req.body.contracts.forEach(contractName => {
            let fileDir = contractsDir + contractName
            if (fs.existsSync(fileDir + '.zen')) {
                zencode = fs.readFileSync(fileDir + '.zen').toString();
                contractFiles.push({
                    name: contractName + '.zen', 
                    content: zencode
                });
            }
            if (fs.existsSync(fileDir + '.keys')) {
                keys = fs.readFileSync(fileDir + '.keys').toString();
                if (keys) {
                    try {
                        if (typeof keys === 'string') {
                            keys = JSON.stringify(JSON.parse(keys));
                        } else {
                            keys = JSON.stringify(keys);
                        }
                    } catch {
                        console.log('Error in converting keys json');
                    }
                    contractFiles.push({
                        name: contractName + '.keys',
                        content: keys
                    })
                }
            }
            if (fs.existsSync(fileDir + '.conf')) {
                config = fs.readFileSync(fileDir + '.conf').toString();
                if (config) {
                    try {
                        if (typeof config === 'string') {
                            config = JSON.stringify(JSON.parse(config));
                        } else {
                            config = JSON.stringify(config);
                        }
                    } catch {
                        console.log('Error in converting keys json');
                    }
                    contractFiles.push({
                        name: contractName + '.conf',
                        content: config
                    });
                }
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
    res.status(200).send(contractFiles);
})

export default router;