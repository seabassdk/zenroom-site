import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import zencode from "@restroom-mw/core";
import db from "@restroom-mw/db";
import http from "@restroom-mw/http";
import sawroom from "@restroom-mw/sawroom";

import ui from "./ui/index.js";
import authRoute from './routes/auth.js';
import userDataRoute from './routes/userData.js';
import dockerRoute from './routes/docker.js';
import zenExposeRoute from './routes/exposeZen.js';

const app = express();

dotenv.config();

//Connect to remote db
mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log('Connected to db!')
);

//App middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.set("json spaces", 2);

//Restroom Middleware
app.use(db.default);
app.use(http.default);
app.use(sawroom.default);
app.use("/docs/:user", ui);
app.use("/api/*", zencode.default);


//Apiroom middleware
app.use('/user', authRoute);
app.use('/data', userDataRoute);
app.use('/docker', dockerRoute);
app.use('/showme', zenExposeRoute);

app.use(express.static('./build'));
app.get('*', (req, res) => {
    if (req.url.startsWith("/api")) {
        return;
    }
    res.sendFile('./build/index.html', { root: '.' });
});

export default app;