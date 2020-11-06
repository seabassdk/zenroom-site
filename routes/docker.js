import express from 'express';
import fs from 'fs';
import verify from '../validation/verifyToken.js';

const router = express.Router({ mergeParams: true });

const contractDir = process.env.ZENCODE_DIR + '/';

router.post('/', verify, (req, res) => {

    let docker = '';
    if (fs.existsSync(process.cwd() + '/dockerfile')) {

        try {
            // read contents of the dockerfile
            const data = fs.readFileSync(process.cwd() + '/dockerfile').toString();

            // split the contents by new line of dockerfile
            const lines = data.split(/\r?\n/);

            // loop all lines of dockerfile
            lines.forEach((line) => {

                if (line.includes('Adding exported contracts')) {
                    docker = docker + line + '\n';

                    let zencode;
                    let keys;
                    let config;

                    const contractsDir = contractDir + req.body.username + '/';

                    req.body.contracts.forEach(contractName => {
                        let fileDir = contractsDir + contractName
                        if (fs.existsSync(fileDir + '.zen')) {
                            zencode = fs.readFileSync(fileDir + '.zen').toString();
                            zencode = zencode.replace(/(?:\r\n|\r|\n)/g, '\\n');

                            docker = docker + 'RUN echo \"' + zencode + '\"> ./zencode/' + contractName + '.zen';
                            docker = docker + '\n';
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
                                docker = docker + "RUN echo '" + keys + "' > ./zencode/" + contractName + ".keys";
                                docker = docker + '\n';
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
                                docker = docker + "RUN echo '" + config + "'> ./zencode/" + contractName + ".conf";
                                docker = docker + '\n';
                            }
                        }

                    });
                } else {
                    docker = docker + line + '\n';
                }

            });
        } catch (err) {
            console.error(err);
        }

    } else {
        console.log('file does NOT exist');
    }

    res.send(docker);

})

export default router;