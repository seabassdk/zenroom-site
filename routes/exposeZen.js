import express from 'express';
import fs from 'fs';

const router = express.Router({ mergeParams: true });

const contracstDir = process.env.ZENCODE_DIR + '/';

router.get('/:part/:username/:contract', (req, res) => {
    const username = req.params.username;
    const part = req.params.part;
    const name = req.params.contract;

    let contractPart;
    switch (part) {
        case 'zencode':
            contractPart = name + '.zen';
            break;
        case 'keys':
            contractPart = name + '.keys';
            break;
        case 'configuration':
            contractPart = name + '.conf';
            break;
        default:
            return res.status(500).send(`Incorrect contract part: ${part}`);
    }

    const userDir = contracstDir + username;
    if (!fs.existsSync(userDir))
        return res.status(500).send(`User does not exist in directory ${userDir}`);

    const fileDir = userDir + '/' + contractPart;
    if (!fs.existsSync(fileDir))
        return res.status(500).send(`Contract does not exist in directory ${fileDir}`);

    const zencode = fs.readFileSync(fileDir).toString();

    res.type('text/plain');
    res.status(200).send(zencode);

})

export default router;