import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import zencode from "@restroom-mw/core";
import db from "@restroom-mw/db";
import http from "@restroom-mw/http";


import ui from "./ui/index.js";
import authRoute from './routes/auth.js';
import userDataRoute from './routes/userData.js';
import dockerRoute from './routes/docker.js';



const app = express();

const port = process.env.HTTPS_PORT || 3010;

dotenv.config();

//Connect to remote db
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log('Connected to db!')
);

//Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.set("json spaces", 2);

app.use(db.default);
app.use(http.default);
app.use("/docs/:user", ui);
app.use("/api/*", zencode.default);


//Route middleware
app.use('/user', authRoute);
app.use('/data', userDataRoute);
app.use('/docker', dockerRoute);

app.use(express.static('./build'));

app.get('*', (req, res) => {
//  res.sendFile(path.join('./build', 'index.html'));
  res.sendFile('./build/index.html', { root: '.' });
});

app.listen(port, () => console.log('Server up and running on ' + port));
