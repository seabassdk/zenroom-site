import express from 'express';
import fs from 'fs';

const router = express.Router({mergeParams: true});

const contracstDir = process.env.ZENCODE_DIR + '/';

router.get('/:username/:contract', (req, res) => {
    const username = req.params.username;
    const contract = req.params.contract + '.zen';
    
    const userDir = contracstDir + username;
    if (!fs.existsSync(userDir)) 
        return res.status(500).send(`User does not exist in directory ${userDir}`);

    const fileDir = userDir + '/' +  contract;
    if (!fs.existsSync(fileDir))
        return res.status(500).send(`Contract does not exist in directory ${fileDir}`);
    
    const zencode = fs.readFileSync(fileDir).toString();

    res.type('text/plain');
    res.status(200).send(zencode);

})

export default router;