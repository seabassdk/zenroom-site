import express from 'express';
import fs from 'fs';
import verify from '../validation/verifyToken.js';

const router = express.Router({ mergeParams: true });

const contractDir = process.env.ZENCODE_DIR + '/';

router.post('/', verify, (req, res) => {

    let rrscript = '';
    if (fs.existsSync(process.cwd() + '/exportRestroom.sh')) {

        try {
            // read contents of the file
            const data = fs.readFileSync(process.cwd() + '/exportRestroom.sh').toString();

            // split the contents by new line of exportRestroom.sh
            const lines = data.split(/\r?\n/);

            // loop all lines of exportRestroom.sh
            lines.forEach((line) => {

                if (line.includes('Adding exported contracts')) {
                    rrscript = rrscript + line + '\n';

                    let zencode;
                    let keys;
                    let config;

                    const contractsDir = contractDir + req.body.username + '/';
                    rrscript = rrscript + '\n';
                    if(req.body.contracts.length && req.body.contracts.length === 0){
                        rrscript = rrscript + "echo NO CONTRACTS EXPORTED FROM APIROOM!"
                        rrscript = rrscript + '\n';
                    }
                    rrscript = rrscript + 'echo Creating directory \"./zencode/' + req.body.username  + '/\"'
                    rrscript = rrscript + '\n';
                    rrscript = rrscript + 'mkdir -p "./zencode/' +  req.body.username + '"\n';
                    rrscript = rrscript + '\n';
                    req.body.contracts.forEach(contractName => {
                        let fileDir = contractsDir + contractName
                        if (fs.existsSync(fileDir + '.zen')) {
                            zencode = fs.readFileSync(fileDir + '.zen').toString();
                            // zencode = zencode.replace(/(?:\r\n|\r|\n)/g, '\\n');
                            rrscript = rrscript + 'echo Creating file \"' + contractName + '.zen\":'
                            rrscript = rrscript + '\n';
                            rrscript = rrscript + 'echo \"' + zencode + '\"> ./zencode/' + req.body.username + '/' + contractName + '.zen';
                            // rrscript = rrscript + "echo '" + zencode + "' > ./zencode/ "+ req.body.username + "/" + contractName + ".zen";
                            rrscript = rrscript + '\n';
                            rrscript = rrscript + '\n';
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
                                rrscript = rrscript + 'echo Creating file \"' + contractName + '.keys\":'
                                rrscript = rrscript + '\n';
                                rrscript = rrscript + "echo '" + keys + "' > ./zencode/" + req.body.username + "/" + contractName + ".keys";
                                rrscript = rrscript + '\n';
                                rrscript = rrscript + '\n';
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
                                rrscript = rrscript + 'echo Creating file \"' + contractName + '.conf\":'
                                rrscript = rrscript + '\n';
                                rrscript = rrscript + "echo '" + config + "' > ./zencode/" + req.body.username + "/" + contractName + ".conf";
                                rrscript = rrscript + '\n';
                                rrscript = rrscript + '\n';
                            }
                        }

                    });
                } else {
                    rrscript = rrscript + line + '\n';
                }

            });
        } catch (err) {
            console.error(err);
        }

    } else {
        console.log('file does NOT exist');
    }

    res.send(rrscript);

})

export default router;