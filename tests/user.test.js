import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import {
    userOneData,
    userTwoData,
    userThreeData,
    userFourData,
    userFiveData,
    userSixData
} from './fixtures/users.js';
import User from '../model/User.js';
import UserData from '../model/UserData.js';

beforeAll(async done => {
    await mongoose.connect(
        process.env.DB_CONNECT,
        { useNewUrlParser: true, useUnifiedTopology: true }
    );
    done();
})

test('Should register a new user', async () => {
    await request(app).post('/user/register').send(userOneData)
        .expect(200);
})

test('Should register another new user', async () => {
    await request(app).post('/user/register').send(userTwoData)
        .expect(200);
})

test('Should not register a new user with incorrect secret password', async () => {
    await request(app).post('/user/register').send(userThreeData)
        .expect(501);
})

test('Should not register a username with none alphanumeric chars', async () => {
    await request(app).post('/user/register').send(userFourData)
        .expect(502);
})

test('Should not register a new user with a short username', async () => {
    await request(app).post('/user/register').send(userFiveData)
        .expect(502);
})

test('Should not register a new user with a username that already exists', async () => {
    await request(app).post('/user/register').send(userSixData)
        .expect(503);
})

afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await User.deleteMany({ username: userOneData.username });
    await User.deleteMany({ username: userTwoData.username });
    await User.deleteMany({ username: userThreeData.username });
    await User.deleteMany({ username: userFourData.username });
    await User.deleteMany({ username: userFiveData.username });
    await User.deleteMany({ username: userSixData.username });

    await UserData.deleteMany({ username: userOneData.username });
    await UserData.deleteMany({ username: userTwoData.username });
    await UserData.deleteMany({ username: userThreeData.username });
    await UserData.deleteMany({ username: userFourData.username });
    await UserData.deleteMany({ username: userFiveData.username });
    await UserData.deleteMany({ username: userSixData.username });

    await mongoose.connection.close()
    done()
})
