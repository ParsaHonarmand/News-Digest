import express from 'express'
import { v1 as uuidv1 } from 'uuid';
const dotenv = require('dotenv')
const axios = require('axios')
const AWS = require("aws-sdk")
const auth = require('./authentication/authenticate')
const { authMiddleware } = require('./authentication/authMiddleware')
const digests = require('./Digests/digests')

dotenv.config();

interface NewsInfo {
  source: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
}


const app = express();
const apiKey = process.env.NEWS_API_KEY;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods",  "*")
  next();
});

app.use(
  express.urlencoded({
    extended: true
  })
)
app.use(express.json())

app.listen(8000, () => {
    console.log('The application is listening on port 8000!');
})

// API endpoints for this application
app.post('/signup', auth.signUp)
app.post('/login', auth.login)

app.post('/subscribe', authMiddleware, digests.addDigest)
app.get('/userfeed', authMiddleware, digests.getDigest)
app.patch('/digest/subscribe', authMiddleware, digests.subscribeToDigest)
app.patch('/digest/unsubscribe', authMiddleware, digests.unsubscribeFromDigest)
app.patch('/digest/delete', authMiddleware, digests.removeDigest)