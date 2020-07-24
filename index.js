// const path = require('path');
// const express = require('express');
// const app = express();
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors');

// const bodyParser = require("body-parser");
// const zencode = require("@restroom-mw/core");
// const ui = require("@restroom-mw/ui");
// const db = require("@restroom-mw/db");

import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';

// import zencode from "@restroom-mw/core";
// import ui from "@restroom-mw/ui";
// import db from "@restroom-mw/db";
import zencode from "@restroom-mw/core";
import db from "@restroom-mw/db";

// const buildPath = path.join(__dirname, 'build');




//import routes
// const authRoute = require('./routes/auth');
// const userDataRoute = require('./routes/userData');
// const testRoute = require('./routes/test');
import ui from "./ui/index.js";
import authRoute from './routes/auth.js';
import userDataRoute from './routes/userData.js';
import swagRoute from './routes/swag.js';

const app = express();

const port = process.env.HTTPS_PORT || 3010;

dotenv.config();

//Connect to db
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log('Connected to db!')
);

//Middleware
// console.log(ui);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.set("json spaces", 2);
// app.use("/api/*", zencode.default);
// app.use("/docs", ui.default({ path: "./zencode" }));

app.use(db.default);
app.use("/docs/:user", ui);
app.use("/api/*", zencode.default);



// const testSwag = (path) => {
//   return (req, res, next) => {
//     console.log('Middleware inside a function. req.username:');
//     console.log(req.username);

//     next();
//   }
// }

// const setSwagUi = (app) => {
//   console.log('Setting swag ui with path: ' + app.get('swagpath'));
//     return ui.default({ path: app.get('swagpath') })
// }

// app.use("/test/:username",function(req, res, next) {
//   console.log('went through middleware');
//   app.set('swagpath', './zencode')
//   console.log('set username inside first middleware: ' + app.get('swagpath'));
//   next();
// }, function(req, res, next) {
//   console.log('Next Middleware and path is ' + app.get('swagpath'));
//   // res.send('done.');
//   next();
// }, setSwagUi(app));



// app.use("/testUser",function(req, res, next) {
//   const user = req.path;
//   console.log(req);
//   app.use("/api/*", zencode.default);
//   app.use("/docs", ui({path: "./zencode" + user}));
//   next();
//   });

//for development only:
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  next();
});
app.use(express.json());


//Route middleware
app.use('/user', authRoute);
app.use('/data', userDataRoute);
app.use('/swag', swagRoute);
// app.use('/test', testRoute);

app.use(express.static('./build'));

app.get('*', (req, res) => {
  // res.sendFile(path.join('./build', 'index.html'));
  res.sendFile('./build/index.html', { root: '.' });
});

app.listen(port, () => console.log('Server up and running on ' + port));