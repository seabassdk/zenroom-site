// const router = require('express').Router();
// const verify = require('../validation/verifyToken');
// const Contract = require('../model/Contract');
// const UserData = require('../model/UserData');
// const fs = require('fs');

import express from 'express';
import fs from 'fs';
import verify from '../validation/verifyToken.js';
import Contract from '../model/Contract.js';
import UserData from '../model/UserData.js';

const router = express.Router({ mergeParams: true });

router.post('/save/contract', verify, (req, res) => {

    console.log('Saving contract to db: ');
    //trim the name and replace spaces with dashes
    const name = req.body.name.trim();
    let fileName = req.body.name.trim();
    fileName = req.body.name.replace(/ /g, "-");
    const reqContract = {
        name,
        file: fileName,
        zencode: req.body.zencode,
        keys: req.body.keys,
        data: req.body.data,
        config: req.body.config
    };
    const userDir = process.cwd() + '/zencode/' + req.body.username;
    const zencodeDir = userDir + '/' + fileName + '.zen';
    const keysDir = userDir + '/' + fileName + '.keys';
    const configDir = userDir + '/' + fileName + '.conf';
    console.log('Saving contract for user id:');
    console.log();
    console.log(reqContract);
    try {
        // const contract = new Contract(reqContract);
        UserData.findOne({ 'username': req.body.username }, (err, userData) => {
            if (err)
                return res.status(500).send('Could not find user! Please contact admin');

            if (nameExists(userData.contracts, name))
                return res.status(500).send('Contract name already exists');


            userData.contracts.push(reqContract);

            userData.save((err) => {
                if (err) {
                    console.log('Could not save in mongo db. Error: ');
                    console.log(err);
                    return res.status(501).send('Could not save contract in db');
                }

                // Create directory for saving zencode contract
                if (!fs.existsSync(userDir)) {
                    fs.mkdirSync(userDir, { recursive: true }, (error) => {
                        if (error) {
                            console.error('An error occurred while creating path: ', error);
                            return res.status(500).send('Could not create directory for file in server.');;
                        }
                    });
                }

                // Create or overwrite file
                fs.writeFileSync(zencodeDir, reqContract.zencode, (error) => {
                    if (error) {
                        console.error('An error occurred when writing file: ', error);
                        return res.status(501).send('Could not create file in server.');;
                    }
                });

                fs.writeFileSync(keysDir, reqContract.keys, (error) => {
                    if (error) {
                        console.error('An error occurred when writing file: ', error);
                        return res.status(501).send('Could not create file in server.');;
                    }
                });

                fs.writeFileSync(configDir, reqContract.config, (error) => {
                    if (error) {
                        console.error('An error occurred when writing file: ', error);
                        return res.status(501).send('Could not create file in server.');;
                    }
                });

                // return successful response
                res.status(200).send('Saved contract!');


            });
        });

    } catch (error) {
        console.log('error saving contract:');
        console.log(error);
        res.status(500).send('Could not save contract.');
    }

});

router.post('/save/:type', verify, async (req, res) => {
    const content = req.body.content;
    const name = req.body.name;
    const userId = req.body.userId;
    const dataType = req.params.type;

    console.log('Saving type: ', dataType);
    console.log('Saving content', content);
    console.log('with id: ', userId);

    try {
        // const user= await UserData.findOne({ 'userId': req.body.userId });
        // console.log('the found user: ');
        // console.log(user);
        UserData.findOne({ 'username': req.body.username }, (err, userData) => {
            //modify and save the object received via callback
            if (err || !userData) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(400).send('Could not retrieve contracts.');
            }

            console.log('found user data.. ');
            // console.log(userData);
            const item = { content: JSON.stringify(content), name };
            switch (dataType) {
                case 'zencode':
                    userData.zencodes.push(item);
                    break;
                case 'keys':
                    userData.keys.push(item);
                    break;
                case 'data':
                    userData.datas.push(item);
                    break;
                case 'config':
                    userData.configs.push(item);
                    break;
                case 'result':
                    userData.results.push(item);
                    break;
                default:
                    res.status(500).send('Could not save ' + dataType);
            }

            userData.save();
            res.status(200).send('saved ' + dataType);
        });
    } catch (error) {
        console.log('There was an error');
        console.log(error);
        res.status(501).send({ msg: 'Could not create file in server.' });
    }
});


router.post('/load/contracts', verify, (req, res) => {
    console.log('loading contracts...');

    try {
        UserData.findOne({ 'username': req.body.username }, (err, userData) => {
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(400).send('Could not retrieve contracts.');
            }
            if (!userData) {
                return res.status(400).send('No contracts found for ' + req.body.username);
            }

            const contractsArray = userData['contracts'];
            console.log('found contracts:');

            // const contractsWithFile = contractsArray.map((contract) => {
            //     console.log('single contract:');
            //     console.log(contract);
            //     const fileDir = process.cwd() + '/zencode/' + req.body.userId + '/' + contract.name + '.zen';
            //     const fileZen = fs.readFileSync(fileDir).toString();
            //     console.log('adding file:')
            //     console.log(fileZen);
            //     return {
            //         ...contract,
            //     }
            // });

            const responseArray = [];
            contractsArray.forEach((contract) => {
                const fileDir = process.cwd() + '/zencode/' + req.body.username + '/' + contract.file;
                let zencode;
                let keys;
                let config;
                let fileSwitch;
                if (fs.existsSync(fileDir + '.zen.off')) {
                    zencode = fs.readFileSync(fileDir + '.zen.off').toString();
                    keys = fs.readFileSync(fileDir + '.keys.off').toString();
                    config = fs.readFileSync(fileDir + '.conf.off').toString();
                    fileSwitch = 'off';
                } else {
                    zencode = fs.readFileSync(fileDir + '.zen').toString();
                    keys = fs.readFileSync(fileDir + '.keys').toString();
                    config = fs.readFileSync(fileDir + '.conf').toString();
                    fileSwitch = 'on';
                }
                console.log('contract switch: ' + fileSwitch);
                responseArray.push({ db: contract, zencode, keys, config, switch: fileSwitch });
            });

            console.log('sending contracts:');
            // console.log(contracts);
            res.status(200).send(responseArray);

        });

    } catch (error) {
        console.log('error finding contracts:');
        console.log(error);
        res.status(400).send('Could not get contracts!');
    }

});

router.post('/load/:type', verify, (req, res) => {

    const dataType = req.params.type;

    console.log('loading type : ' + dataType);
    console.log('user name: ' + req.body.username);

    try {
        UserData.findOne({ 'username': req.body.username }, async (err, userData) => {
            //modify and save the object received via callback
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(500).send('Could not retrieve contracts.');
            }
            if (!userData) {
                console.log('NO USER DATA');
                return res.status(404).send('No user data to fetch! (contact admin)');
            }
            let filetype;
            switch (dataType) {
                case 'zencodes':
                    filetype = 'zen';
                    break;
                case 'keys':
                    filetype = 'keys';
                    break;
                case 'datas':
                    filetype = 'null';
                    break;
                case 'configs':
                    filetype = 'config';
                    break;
                default:
                    fileType = 'not found';
            }

            const dir = process.cwd() + '/zencode/' + req.body.username;

            let returnFileArray = [];
            if (fs.existsSync(dir)) {
                console.log('getting files with type: ' + filetype);
                const dirCont = await fs.readdirSync(dir);
                returnFileArray = dirCont.filter((file) => {
                    return file.match(new RegExp(`.*\.(${filetype})`, 'ig'));
                });
                returnFileArray = returnFileArray.map((fileName) => {
                    return { name: fileName }
                });
                console.log(returnFileArray);
            } else {
                console.log('NO FILES FOUND FOR: ' + fileType)
            }





            const returnTypeArray = userData[dataType];

            const returnArray = [...returnTypeArray, ...returnFileArray]
            // const returnArraycontract = 
            if (Array.isArray(returnArray)) {
                console.log('sending back array:');
                console.log(returnArray);
                res.status(200).send(returnArray);
            } else {
                res.status(500).send(dataType + ' is not of type array (contact admin)');
            }

        });
    } catch (error) {
        console.log('There was an error');
        console.log(error);
        res.status(501).send('Could not load request.');
    }

});

router.post('/update/:type/:index/:field', verify, (req, res) => {

    const type = req.params.type;
    const index = req.params.index;
    const field = req.params.field;
    const content = req.body.content;

    if (!content)
        res.status(500).send('Nothing to save...');

    console.log('updating type: ' + type + ' with index: ' + index);

    try {
        UserData.findOne({ 'username': req.body.username }, async (err, userData) => {
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(500).send('Error when attempting to retrieve contracts.');
            }
            if (!userData) {
                console.log('NO USER DATA');
                return res.status(404).send('No user data to fetch! (contact admin)');
            }
            const contract = userData[type][index];
            contract[field] = content;

            const saved = await userData.save();

            res.status(200).send('updated ok');

        });
    } catch (error) {
        console.log('There was an error');
        console.log(error);
        res.status(501).send('Could not update ' + type);
    }

});

router.post('/update/contract/:index', verify, (req, res) => {

    const index = req.params.index;
    const reqContract = req.body.contract;
    const username = req.body.username

    if (!reqContract)
        res.status(501).send('Nothing to save...');

    console.log('updating contract with index: ' + index);

    try {
        UserData.findOne({ 'username': username }, async (err, userData) => {
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(500).send('Error when attempting to retrieve contracts.');
            }
            if (!userData) {
                console.log('NO USER DATA');
                return res.status(404).send('No user data to fetch! (contact admin)');
            }

            console.log('request contract:');
            console.log(reqContract);

            console.log('current contract:');
            console.log(userData['contracts'][index]);

            userData['contracts'][index].zencode = reqContract.zencode;
            userData['contracts'][index].keys = reqContract.keys;
            userData['contracts'][index].data = reqContract.data;
            userData['contracts'][index].config = reqContract.config;

            console.log('updated contract:');
            console.log(userData['contracts'][index]);

            const fileDir = process.cwd() + '/zencode/' + username + '/' + userData['contracts'][index].file;
            const zencode = createFile(fileDir + '.zen', reqContract.zencode);
            const keys = createFile(fileDir + '.keys', reqContract.keys);
            const config = createFile(fileDir + '.conf', reqContract.config);

            const saved = await userData.save();

            res.status(200).send({ msg: 'saved ok' });

        });
    } catch (error) {
        console.log('There was an error');
        console.log(error);
        res.status(501).send('Could not update contract');
    }

});

//Should update only one field at a time, but for now update all even when only one should change.
router.post('/update/contractfield/:index', verify, (req, res) => {

    const index = req.params.index;
    const reqContract = req.body.contract;
    const username = req.body.username;

    if (!reqContract)
        res.status(501).send('Nothing to save...');

    try {
        UserData.findOne({ 'username': username }, async (err, userData) => {
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(500).send('Error when attempting to retrieve contracts.');
            }
            if (!userData) {
                console.log('NO USER DATA');
                return res.status(404).send('No user data to fetch! (contact admin)');
            }

            userData['contracts'][index] = reqContract.db;


            const fileDir = process.cwd() + '/zencode/' + username + '/' + userData['contracts'][index].file;
            if (fs.existsSync(fileDir + '.zen.off')) {
                createFile(fileDir + '.zen.off', reqContract.zencode);
                createFile(fileDir + '.keys.off', reqContract.keys);
                createFile(fileDir + '.conf.off', reqContract.config);
            } else {
                createFile(fileDir + '.zen', reqContract.zencode);
                createFile(fileDir + '.keys', reqContract.keys);
                createFile(fileDir + '.conf', reqContract.config);
            }



            userData.save((err) => {
                if (err) {
                    console.log('Could not save in mongo db. Error: ');
                    console.log(err);
                    return res.status(501).send('Could not save contract in db');
                }
                const contract = userData['contracts'][index];
                res.status(200).send({ db: contract, zencode: reqContract.zencode, keys: reqContract.keys, config: reqContract.config });
            });



        });
    } catch (error) {
        console.log('There was an error');
        console.log(error);
        res.status(501).send('Could not update contract');
    }

});

router.delete('/delete/contract/:index', verify, (req, res) => {

    const index = req.params.index;
    const username = req.body.username;
    // console.log(req);

    try {
        UserData.findOne({ 'username': username }, async (err, userData) => {
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(500).send('Error when attempting to retrieve contracts.');
            }
            if (!userData) {
                console.log('NO USER DATA');
                return res.status(404).send('No user data to fetch! (contact admin)');
            }


            const fileDir = process.cwd() + '/zencode/' + username + '/' + userData['contracts'][index].file;
            try {
                fs.unlinkSync(fileDir + '.zen');
                fs.unlinkSync(fileDir + '.keys');
                fs.unlinkSync(fileDir + '.conf');
            } catch (error) {
                console.log('caught error while deleting');
            }

            userData['contracts'].splice(index);

            userData.save((err) => {
                if (err) {
                    console.log('Could not save in mongo db. Error: ');
                    console.log(err);
                    return res.status(501).send('Could not save contract in db');
                }
                console.log('successfully deleted contract.');
                res.status(200).send('contract deleted');
            });

        });
    } catch (error) {
        console.log('There was an error');
        console.log(error);
        res.status(501).send('Could not update contract');
    }

});


router.post('/contract/switch/:index', verify, (req, res) => {
    const index = req.params.index;
    const username = req.body.username;
    // console.log(req);

    try {
        UserData.findOne({ 'username': username }, async (err, userData) => {
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(500).send('Error when attempting to retrieve contracts.');
            }
            if (!userData) {
                console.log('NO USER DATA');
                return res.status(404).send('No user data to fetch! (contact admin)');
            }


            const fileDir = process.cwd() + '/zencode/' + username + '/' + userData['contracts'][index].file;
            let responseSwitch;

            if (fs.existsSync(fileDir + '.zen.off')) {
                fs.renameSync(fileDir + '.zen.off', fileDir + '.zen');
                fs.renameSync(fileDir + '.keys.off', fileDir + '.keys');
                fs.renameSync(fileDir + '.conf.off', fileDir + '.conf');
                responseSwitch = 'on';
            } else {
                fs.renameSync(fileDir + '.zen', fileDir + '.zen.off');
                fs.renameSync(fileDir + '.keys', fileDir + '.keys.off');
                fs.renameSync(fileDir + '.conf', fileDir + '.conf.off');
                responseSwitch = 'off';
            }

            res.status(200).send(responseSwitch);

        });
    } catch (error) {
        console.log('There was an error');
        console.log(error);
        res.status(501).send('Could not update contract');
    }
})

const readFile = (filePath) => {

    let content = fs.readFileSync(filePath).toString()

    return content;
}

const createFile = (filePath, fileContent) => {
    fs.writeFileSync(filePath, fileContent, (error) => {
        if (error) {
            console.error('An error occurred: ', error);
            return false;
        } else {
            console.log('Your file has been created.');
            return true;
        }
    });
}

const createDir = (dirPath) => {
    fs.mkdirSync(dirPath, { recursive: true }, (error) => {
        if (error) {
            console.error('An error occurred: ', error);
            return false;
        } else {
            console.log('Your directory is created!');

        }
    });
}

const nameExists = (itemArray, name) => {
    const found = itemArray.find((item) => {
        return item.name === name;
    })

    return found;


}

export default router;