import mongoose from 'mongoose';
import request from 'supertest';
import fs from 'fs';
import app from '../app.js';
import {
    userOneData,
    userTwoData
} from './fixtures/users.js';
import {
    contract1,
    contract2,
    keys1,
    conf1
} from './fixtures/contracts';
import User from '../model/User.js';
import UserData from '../model/UserData.js';
import rimraf from 'rimraf';


let user1;
let user2;
beforeAll(async done => {
    // await mongoose.connect(
    //     process.env.DB_CONNECT,
    //     { useNewUrlParser: true, useUnifiedTopology: true }
    // );

    await User.deleteMany({ username: userOneData.username });
    await User.deleteMany({ username: userTwoData.username });
    await UserData.deleteMany({ username: userOneData.username });
    await UserData.deleteMany({ username: userTwoData.username });

    const response1 = await request(app).post('/user/register').send(userOneData);
    const response2 = await request(app).post('/user/register').send(userTwoData);
    user1 = response1.body;
    user2 = response2.body;
    done();
})

test('Should fail if wrong token is provided', async () => {
    contract1.username = user1.username;
    const response1 = await request(app)
        .post('/data/save/contract')
        .set('auth-token', 'user1.token')
        .send(contract1)
        .expect(500)
})

test('Should save a contract for user', async () => {
    contract1.username = user1.username;
    const response1 = await request(app)
        .post('/data/save/contract')
        .set('auth-token', user1.token)
        .send(contract1)
        .expect(200)
})

test('Should fail contract name already exists', async () => {
    contract1.username = user1.username;
    const response1 = await request(app)
        .post('/data/save/contract')
        .set('auth-token', user1.token)
        .send(contract1)
        .expect(502)
})

test('Should save individual contract components', async () => {
    const newItem1 = {
        name: 'user1 keys',
        username: user1.username,
        content: keys1
    };

    const newItem2 = {
        name: 'user1 keys',
        username: user1.username,
        content: conf1
    };

    await request(app)
        .post('/data/save/keys')
        .set('auth-token', user1.token)
        .send(newItem1)
        .expect(200)

    await request(app)
        .post('/data/save/config')
        .set('auth-token', user1.token)
        .send(newItem2)
        .expect(200)
});

test('Should be the same contract in file and db', async () => {
    // only one data doc for this username
    const userOneDataDb = await UserData.find({ username: user1.username });
    // only one contract created for the data doc
    const contractDb = userOneDataDb[0].contracts[0];
    const userDir = process.env.ZENCODE_DIR + '/' + user1.username;
    const contractDir = userDir + '/' + contractDb.file;
    const zencode = fs.readFileSync(contractDir + '.zen').toString();
    const keys = fs.readFileSync(contractDir + '.keys').toString();
    const config = fs.readFileSync(contractDir + '.conf').toString();

    expect(userOneDataDb.length).toEqual(1);
    expect(userOneDataDb[0].contracts.length).toEqual(1);
    expect(fs.existsSync(userDir)).toBeTruthy();
    expect(fs.existsSync(contractDir + '.zen')).toBeTruthy();
    expect(fs.existsSync(contractDir + '.keys')).toBeTruthy();
    expect(fs.existsSync(contractDir + '.conf')).toBeTruthy();
    expect(contractDb['zencode']).toEqual(zencode);
    expect(contractDb['keys']).toEqual(keys);
    expect(contractDb['config']).toEqual(config);
});

test('Should load all contracts from user', async () => {
    //save another contract
    contract2.username = user1.username;
    await request(app)
        .post('/data/save/contract')
        .set('auth-token', user1.token)
        .send(contract2)
        .expect(200)

    const response = await request(app)
        .post('/data/load/contracts')
        .set('auth-token', user1.token)
        .send({ username: user1.username })
        .expect(200)

    expect(response.body.length).toEqual(2);
});

test('Should be the same zencode contract name in file and db for custom user', async () => {
    const username = process.env.TEST_DB_AND_FILES_MATCH_FOR_USER || false;
    if (username) {
        const userDir = process.env.ZENCODE_DIR + '/' + username;
        if (fs.existsSync(userDir)) {
            const contracstFiles = fs.readdirSync(userDir);
            const userDb = await UserData.find({ username: username });
            const contracstDb = userDb[0].contracts;
            contracstDb.forEach((contract, index) => {
                const contractDir = userDir + '/' + contract.file;
                const zencode = fs.readFileSync(contractDir + '.zen').toString();
                const keys = fs.readFileSync(contractDir + '.keys').toString();
                const config = fs.readFileSync(contractDir + '.conf').toString();
                expect(contract['zencode']).toEqual(zencode);
                expect(contract['keys']).toEqual(keys);
                expect(contract['config']).toEqual(config);
            });
        }
    }
})

afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await User.deleteMany({ username: user1.username });
    await User.deleteMany({ username: user2.username });
    await UserData.deleteMany({ username: user1.username });
    await UserData.deleteMany({ username: user2.username });
    await mongoose.connection.close();

    const user1Dir = process.env.ZENCODE_DIR + '/' + user1.username;
    const user2Dir = process.env.ZENCODE_DIR + '/' + user2.username;
    if (fs.existsSync(user1Dir))
        fs.rmdirSync(user1Dir, { recursive: true });
    if (fs.existsSync(user2Dir))
        fs.rmdirSync(user2Dir, { recursive: true });
    user1 = null;
    user2 = null;
    done();
})