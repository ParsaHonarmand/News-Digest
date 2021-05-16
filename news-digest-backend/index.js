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
// const { authMiddleware } = require('./authMiddleware')
dotenv.config();
AWS.config.update({
    region: "us-west-2" // replace with your region in AWS account
});
var DynamoDB = new AWS.DynamoDB();
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
    console.log('The application is listening on port 3000!');
});
app.get('/', function (req, res) {
    res.send('Well done!');
});
// API endpoints for this application
app.post('/signup', auth.signUp);
app.post('/login', auth.login);
app.post('/subscribe', authMiddleware, digests.addDigest);
app.get('/userfeed', authMiddleware, digests.getDigest);
app.patch('/digest/subscribe', authMiddleware, digests.subscribeToDigest);
app.patch('/digest/unsubscribe', authMiddleware, digests.unsubscribeFromDigest);
app.patch('/digest/delete', authMiddleware, digests.removeDigest);
app.post('/signup', function (req, res) {
    console.log(req.body);
});
app.get('/news', function (req, getRes) {
    var keyword = req.query.keyword;
    var source = req.query.source;
    var topic = req.query.topic;
    var newsResponse = [];
    axios
        .get("https://newsapi.org/v2/everything?q=" + keyword + "&apiKey=" + apiKey)
        .then(function (res) {
        console.log("statusCode: " + res.status);
        console.log(res.data.articles);
        var articles = res.data.articles;
        articles.forEach(function (article) {
            var stringDate = article.publishedAt;
            var date = new Date(stringDate);
            var today = new Date();
            var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            if (today >= date && lastWeek <= date) {
                var newsObj = {
                    source: article.source.name,
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    urlToImage: article.urlToImage == null
                        ? "https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
                        : article.urlToImage,
                    publishedAt: article.publishedAt
                };
                newsResponse.push(newsObj);
                // addDigest(newsObj)
            }
        });
        getRes.send(newsResponse);
    })
        .catch(function (error) {
        console.error(error);
    });
});
