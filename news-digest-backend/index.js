"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv = require('dotenv');
var axios = require('axios');
var AWS = require("aws-sdk");
var auth = require('./authentication/authenticate');
var authMiddleware = require('./authentication/authMiddleware').authMiddleware;
var digests = require('./Digests/digests');
dotenv.config();
var app = express_1.default();
var apiKey = process.env.NEWS_API_KEY;
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});
app.use(express_1.default.urlencoded({
    extended: true
}));
app.use(express_1.default.json());
app.listen(8000, function () {
    console.log('The application is listening on port 8000!');
});
// API endpoints for this application
app.post('/signup', auth.signUp);
app.post('/login', auth.login);
app.post('/subscribe', authMiddleware, digests.addDigest);
app.get('/userfeed', authMiddleware, digests.getDigest);
app.patch('/digest/subscribe', authMiddleware, digests.subscribeToDigest);
app.patch('/digest/unsubscribe', authMiddleware, digests.unsubscribeFromDigest);
app.patch('/digest/delete', authMiddleware, digests.removeDigest);
