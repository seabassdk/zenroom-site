import express from 'express';
import fs from 'fs';
import verify from '../validation/verifyToken.js';

const router = express.Router({ mergeParams: true });

const contractDir = process.env.ZENCODE_DIR + '/';

router.post('/', verify, (req, res) => {
    //Lets validate the data before we add a user
    console.log('received contracts:');
    console.log(req.body.contracts);

    let docker = '';
    if (fs.existsSync(process.cwd() + '/dockerfile')) {
        console.log('file exists');
        try {
            // read contents of the file
            const data = fs.readFileSync(process.cwd() + '/dockerfile').toString();

            // split the contents by new line
            const lines = data.split(/\r?\n/);

            // print all lines
            lines.forEach((line) => {

                if (line.includes('Adding exported contracts')) {
                    docker = docker + line + '\n';
                    console.log('ADD EXPORTED CONTRACTS HERE.');
                    let zencode;
                    let keys;
                    let config;

                    const contractsDir = contractDir + req.body.username + '/';

                    req.body.contracts.forEach(contractName => {
                        let fileDir = contractsDir + contractName
                        if (fs.existsSync(fileDir + '.zen')) {
                            zencode = fs.readFileSync(fileDir + '.zen').toString();
                            zencode = zencode.replace(/'/g, "\\'");
                            zencode = zencode.replace(/(?:\r\n|\r|\n)/g, '\\n\\');

                            docker = docker + "RUN echo -e $'" + zencode + "'\\\n";
                            docker = docker + "> ./zencode/" + contractName + ".zen\n";
                            docker = docker + '\n';

                        }
                        if (fs.existsSync(fileDir + '.keys')) {
                            keys = fs.readFileSync(fileDir + '.keys').toString();
                            docker = docker + "RUN echo $'" + keys + "'\\\n";
                            docker = docker + "> ./zencode/" + contractName + ".keys\n";
                            docker = docker + '\n';
                        }
                        if (fs.existsSync(fileDir + '.conf')) {
                            config = fs.readFileSync(fileDir + '.conf').toString();
                            docker = docker + "RUN echo $'" + config + "'\\\n";
                            docker = docker + "> ./zencode/" + contractName + ".conf\n";
                            docker = docker + '\n';
                        }

                    });
                } else {
                    docker = docker + line + '\n';
                    console.log('.');
                }

            });
        } catch (err) {
            console.error(err);
        }

    } else {
        console.log('file does NOT exist');
    }

    console.log('SENDING DOCKER');
    res.send(docker);

})

export default router;