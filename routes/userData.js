const router = require('express').Router();
const verify = require('../validation/verifyToken');
const Contract = require('../model/Contract');
const UserData = require('../model/UserData');
const fs = require('fs');

router.post('/save/contract', verify, (req, res) => {

    console.log('Saving contract to db: ');

    const reqContract = {
        name: req.body.name,
        zencode: req.body.zencode,
        keys: req.body.keys,
        data: req.body.data,
        config: req.body.config
    };
    const userDir = process.cwd() + '/zencode/' + req.body.userId;
    const fileName = userDir + '/' + reqContract.name + '.zen';
    console.log('updating user contract for user id:');
    console.log();
    console.log(reqContract);
    try {
        // const contract = new Contract(reqContract);
        UserData.findOne({ 'userId': req.body.userId }, (err, userData) => {
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(400).send({ msg: 'Could not retrieve contracts.' });
            }

            userData.contracts.push(reqContract);
            userData.save((err) => {
                if (err) {
                    console.log('Could not save in mongo db. Error: ');
                    console.log(err);
                    return res.status(501).send({ msg: 'Could not save contract in db' });
                }

                // Create directory for saving zencode contract
                fs.mkdirSync(userDir, { recursive: true }, (error) => {
                    if (error) {
                        console.error('An error occurred while creating path: ', error);
                        return res.status(501).send({ msg: 'Could not create directory for file in server.' });;
                    }
                });

                // Create or overwrite file
                fs.writeFileSync(fileName, reqContract.zencode, (error) => {
                    if (error) {
                        console.error('An error occurred when writing file: ', error);
                        return res.status(501).send({ msg: 'Could not create file in server.' });;
                    }
                });

                // return successful response
                res.status(200).send({ msg: 'Saved contract!' });


            });
        });

    } catch (error) {
        console.log('error saving contract to db:');
        console.log(error);
        res.status(400).send({ msg: 'Could not save contract..' });
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
        UserData.findOne({ 'userId': req.body.userId }, (err, userData) => {
            //modify and save the object received via callback
            if (err || !userData) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(400).send({ msg: 'Could not retrieve contracts.' });
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
                    res.status(500).send({ error: 'Could not save ' + dataType });
            }


            userData.save();
            res.status(200).send({ msg: 'saved ' + dataType });
        });
    } catch (error) {
        console.log('There was an error');
        console.log(error);
        res.status(501).send({ msg: 'Could not create file in server.' });
    }
});

router.post('/load', verify, (req, res) => {
    console.log('loading contracts...');

    try {
        Contract.find({ 'userId': req.body.userId }, function (err, docs) {
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(400).send({ msg: 'Could not retrieve contracts.' });
            }

            let fileDir;
            let file;
            const contracts = docs.map((contract) => {

                fileDir = process.cwd() + '/zencode/' + contract.userId + '/' + contract.name + '.zen';
                file = fs.readFileSync(fileDir).toString();
                return {
                    ...contract,
                    file
                }
            });
            console.log('found and sending docs');
            res.status(200).send({ contracts });

        });

    } catch (error) {
        console.log('error finding contracts:');
        console.log(error);
        res.status(400).send({ msg: 'Could not get contracts..' });
    }

});

router.post('/load/contracts', verify, (req, res) => {
    console.log('loading contracts...');

    try {
        UserData.findOne({ 'userId': req.body.userId }, (err, userData) => {
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(400).send({ msg: 'Could not retrieve contracts.' });
            }
            if (!userData) {
                console.log('NO USER DATA');
                return res.status(400).send([]);
            }

            const contractsArray = userData['contracts'];
            console.log('found contracts:');
            console.log(contractsArray);

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
                const fileDir = process.cwd() + '/zencode/' + req.body.userId + '/' + contract.name + '.zen';
                const file = fs.readFileSync(fileDir).toString();
                responseArray.push({db: contract, file});
            });


            console.log('result of map:');
            console.log(responseArray)
            console.log('found and sending contracts:');
            // console.log(contracts);
            res.status(200).send(responseArray);

        });

    } catch (error) {
        console.log('error finding contracts:');
        console.log(error);
        res.status(400).send({ msg: 'Could not get contracts..' });
    }

});

router.post('/load/:type', verify, (req, res) => {

    const dataType = req.params.type;

    console.log('loading type : ' + dataType);
    console.log('user id: ' + req.body.userId);

    try {
        UserData.findOne({ 'userId': req.body.userId }, (err, userData) => {
            //modify and save the object received via callback
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(400).send({ error: 'Could not retrieve contracts.' });
            }
            if (!userData) {
                console.log('NO USER DATA');
                return res.status(400).send([]);
            }
            console.log('responding array data');
            let returnArray = userData[dataType]
            if (Array.isArray(returnArray)) {
                console.log('sending back array:');
                res.status(200).send(returnArray);
            } else {
                res.status(404).send({ error: 'Could not find ' + dataType });
            }

        });
    } catch (error) {
        console.log('There was an error');
        console.log(error);
        res.status(501).send({ msg: 'Could not load request.' });
    }

});

router.post('/update/:type/:index/:field', verify, (req, res) => {

    const type = req.params.type;
    const index = req.params.index;
    const field = req.params.field;
    const content = req.body.content;

    if (!content)
        res.status(501).send({ error: 'Nothing to save...' });

    console.log('updating type: ' + type + ' with index: ' + index);

    try {
        UserData.findOne({ 'userId': req.body.userId }, async (err, userData) => {
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(400).send({ msg: 'Could not retrieve contracts.' });
            }
            if (!userData) {
                console.log('NO USER DATA');
                return res.status(400).send([]);
            }
            const contract = userData['contracts'][index];
            contract[field] = content;
            
            const saved = await userData.save();

            res.status(200).send({msg: 'saved ok'});

        });
    } catch (error) {
        console.log('There was an error');
        console.log(error);
        res.status(501).send({ msg: 'Could not load request.' });
    }

});

router.post('/update/contract/:index', verify, (req, res) => {

    const index = req.params.index;
    const reqContract = req.body.contract;

    if (!reqContract)
        res.status(501).send({ error: 'Nothing to save...' });

    console.log('updating contract with index: ' + index);

    try {
        UserData.findOne({ 'userId': req.body.userId }, async (err, userData) => {
            if (err) {
                console.log('ERROR RETRIEVING CONTRACTS');
                return res.status(400).send({ msg: 'Could not retrieve contracts.' });
            }
            if (!userData) {
                console.log('NO USER DATA');
                return res.status(400).send([]);
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
            
            
            const saved = await userData.save();

            res.status(200).send({msg: 'saved ok'});

        });
    } catch (error) {
        console.log('There was an error');
        console.log(error);
        res.status(501).send({ msg: 'Could not load request.' });
    }

});




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

module.exports = router;