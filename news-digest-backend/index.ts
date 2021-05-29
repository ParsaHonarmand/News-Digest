import express from 'express'
const dotenv = require('dotenv')
const axios = require('axios')
const AWS = require("aws-sdk")
const auth = require('./Authentication/authenticate')
const { authMiddleware } = require('./Authentication/authMiddleware')
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

app.listen(process.env.PORT || 8000, () => {
    console.log('The application is listening on port 8000!');
})

// API endpoints for this application
app.get('/', (req, res) => {
  res.sendStatus(200).send("Welcome!")
})
app.post('/signup', auth.signUp)
app.post('/login', auth.login)

app.post('/subscribe', authMiddleware, digests.addDigest)
app.get('/userfeed', authMiddleware, digests.getDigest)
app.patch('/digest/subscribe', authMiddleware, digests.subscribeToDigest)
app.patch('/digest/unsubscribe', authMiddleware, digests.unsubscribeFromDigest)
app.patch('/digest/delete', authMiddleware, digests.removeDigest)