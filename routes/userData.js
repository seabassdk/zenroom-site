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

const contractDir =  process.env.ZENCODE_DIR + '/';

router.post('/save/contract', verify, (req, res) => {
    //trim the name and replace spaces with dashes
    const name = req.body.name.trim();
    const fileName = name.replace(/ /g, "-");
    const reqContract = {
        name,
        file: fileName,
        zencode: req.body.zencode,
        keys: req.body.keys,
        data: req.body.data,
        config: req.body.config
    };
    const userDir = contractDir + req.body.username;
    const zencodeDir = userDir + '/' + fileName + '.zen';
    const keysDir = userDir + '/' + fileName + '.keys';
    const configDir = userDir + '/' + fileName + '.conf';
    try {
        UserData.findOne({ 'username': req.body.username }, (err, userData) => {
            if (err)
                return res.status(501).send('Could not find user! Please contact admin');

            if (nameExists(userData.contracts, name))
                return res.status(502).send('Contract name already exists');

            userData.contracts.push(reqContract);
            userData.save((err) => {
                if (err) {
                    console.log('Could not save in mongo db. Error: ');
                    console.log(err);
                    return res.status(501).send('Could not save contract in db');
                }
                // Create directory
                if (!fs.existsSync(userDir)) {
                    fs.mkdirSync(userDir, { recursive: true }, (error) => {
                        if (error) {
                            console.error('An error occurred while creating path: ', error);
                            return res.status(503).send('Could not create directory for file in server.');;
                        }
                    });
                }
                // Create or overwrite files
                fs.writeFileSync(zencodeDir, reqContract.zencode, (error) => {
                    if (error) {
                        console.error('An error occurred when writing file: ', error);
                        return res.status(503).send('Could not create file in server.');;
                    }
                });
                fs.writeFileSync(keysDir, reqContract.keys, (error) => {
                    if (error) {
                        console.error('An error occurred when writing file: ', error);
                        return res.status(503).send('Could not create file in server.');;
                    }
                });
                fs.writeFileSync(configDir, reqContract.config, (error) => {
                    if (error) {
                        console.error('An error occurred when writing file: ', error);
                        return res.status(503).send('Could not create file in server.');;
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
    const dataType = req.params.type;
    try {
        UserData.findOne({ 'username': req.body.username }, (err, userData) => {
            //modify and save the object received via callback
            if (err || !userData)
                return res.status(400).send('Could not retrieve contracts.');
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
    try {
        UserData.findOne({ 'username': req.body.username }, (err, userData) => {
            if (err)
                return res.status(400).send('Could not retrieve contracts.');
            if (!userData)
                return res.status(400).send('No contracts found for ' + req.body.username);
            const contractsArray = userData['contracts'];
            const responseArray = [];
            contractsArray.forEach((contract) => {
                const fileDir = contractDir + req.body.username + '/' + contract.file;
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
                responseArray.push({ db: contract, zencode, keys, config, switch: fileSwitch });
            });
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
    try {
        UserData.findOne({ 'username': req.body.username }, async (err, userData) => {
            //modify and save the object received via callback
            if (err)
                return res.status(500).send('Could not retrieve contracts.');

            if (!userData)
                return res.status(404).send('No user data to fetch! (contact admin)');

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
            const dir = contractDir + req.body.username;
            let returnFileArray = [];
            if (fs.existsSync(dir)) {
                //get all the files in the user directory
                const dirCont = await fs.readdirSync(dir);
                //filter files to get the requested file type
                returnFileArray = dirCont.filter((file) => {
                    return file.match(new RegExp(`.*\.(${filetype})`, 'ig'));
                });
                returnFileArray = returnFileArray.map((fileName) => {
                    const content = readFile(dir + '/' + fileName);
                    return { name: fileName, content }
                });
            }
            const returnTypeArray = userData[dataType];
            const returnArray = [...returnTypeArray, ...returnFileArray]
            // const returnArraycontract = 
            if (Array.isArray(returnArray)) {
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

    try {
        UserData.findOne({ 'username': username }, async (err, userData) => {
            if (err) 
                return res.status(500).send('Error when attempting to retrieve contracts.');

            if (!userData)
                return res.status(404).send('No user data to fetch! (contact admin)');
            
            userData['contracts'][index].zencode = reqContract.zencode;
            userData['contracts'][index].keys = reqContract.keys;
            userData['contracts'][index].data = reqContract.data;
            userData['contracts'][index].config = reqContract.config;
            const fileDir = contractDir +'/' + username + '/' + userData['contracts'][index].file;
            createFile(fileDir + '.zen', reqContract.zencode);
            createFile(fileDir + '.keys', reqContract.keys);
            createFile(fileDir + '.conf', reqContract.config);
            await userData.save();
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

            let fileSwitch;
            const fileDir = contractDir + username + '/' + userData['contracts'][index].file;
            if (fs.existsSync(fileDir + '.zen.off')) {
                createFile(fileDir + '.zen.off', reqContract.zencode);
                createFile(fileDir + '.keys.off', reqContract.keys);
                createFile(fileDir + '.conf.off', reqContract.config);
                fileSwitch='off';
            } else {
                createFile(fileDir + '.zen', reqContract.zencode);
                createFile(fileDir + '.keys', reqContract.keys);
                createFile(fileDir + '.conf', reqContract.config);
                fileSwitch='on';
            }



            userData.save((err) => {
                if (err) {
                    console.log('Could not save in mongo db. Error: ');
                    console.log(err);
                    return res.status(501).send('Could not save contract in db');
                }
                const contract = userData['contracts'][index];
                res.status(200).send({ db: contract, zencode: reqContract.zencode, keys: reqContract.keys, config: reqContract.config, switch: fileSwitch });
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
    try {
        UserData.findOne({ 'username': username }, async (err, userData) => {
            if (err)
                return res.status(500).send('Error when attempting to retrieve contracts.');
            
            if (!userData)
                return res.status(404).send('No user data to fetch! (contact admin)');
            
            const fileDir = contractDir + username + '/' + userData['contracts'][index].file;
            try {
                fs.unlinkSync(fileDir + '.zen');
                fs.unlinkSync(fileDir + '.keys');
                fs.unlinkSync(fileDir + '.conf');
            } catch (error) {
                console.log('caught error while deleting contract files');
            }
            const indexInt = parseInt(index);
            const newContracts = userData['contracts'].filter((contract, i) => i !== indexInt); 
            userData['contracts'] = newContracts;
            userData.save((err) => {
                if (err)
                    return res.status(501).send('Could not save contract in db');
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
    try {
        UserData.findOne({ 'username': username }, async (err, userData) => {
            if (err)
                return res.status(500).send('Error when attempting to retrieve contracts.');

            if (!userData)
                return res.status(404).send('No user data to fetch! (contact admin)');

            const fileDir = contractDir + username + '/' + userData['contracts'][index].file;
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
            return false;
        } else {
            return true;
        }
    });
}

const createDir = (dirPath) => {
    fs.mkdirSync(dirPath, { recursive: true }, (error) => {
        if (error) {
            console.error('An error occurred: ', error);
            return false;
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