const path = require('path');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
var cors = require('cors');

const bodyParser = require("body-parser");
const zencode = require("@restroom-mw/core");
const ui = require("@restroom-mw/ui");
const db = require("@restroom-mw/db");

const buildPath = path.join(__dirname, 'build');
const port = process.env.PORT || 3001;

//import routes
const authRoute = require('./routes/auth');
const userDataRoute = require('./routes/userData');
const testRoute = require('./routes/test');

dotenv.config();

//Connect to db
mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log('Connected to db!')
);

//Middleware
// console.log(ui);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require("morgan")("dev"));
app.set("json spaces", 2);
app.use("/api/*", zencode.default);
app.use("/docs", ui.default);

//for development only:
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.use(express.json());


//Route middleware
app.use('/user', authRoute);
app.use('/data', userDataRoute);
app.use('/test', testRoute);

app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => console.log('Server up and running'));