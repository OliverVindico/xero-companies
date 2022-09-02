require('dotenv').config()
const config = require('./configServer.js');
global.config = config
const express = require('express');
const router = express();
const path = require('path');
global.appRoot = path.resolve(__dirname);
const cors = require('cors');

router.use(cors())
router.use(express.json({ limit: '50mb' }));
router.use(express.json({ type: '*/*' }));

router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const xeroc = require("./routes/xero");
router.use("/xero", xeroc)

const port = config.PORT || 8080;
router.listen(port, () => {
    console.log(`${config.NODE_ENV.toUpperCase()} Server listening on protocol ${config.PROTOCOL} & port ${port}`);
});

const startServer = async () => {
    console.log('Server starting...');

};

startServer();
