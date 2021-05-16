import express from 'express'
import { v1 as uuidv1 } from 'uuid';
const dotenv = require('dotenv')
const axios = require('axios')
const AWS = require("aws-sdk")
const auth = require('./authentication/authenticate')
const { authMiddleware } = require('./authentication/authMiddleware')
const digests = require('./Digests/digests')
// const { authMiddleware } = require('./authMiddleware')

dotenv.config();

AWS.config.update({
  region: "us-west-2" // replace with your region in AWS account
});
const DynamoDB = new AWS.DynamoDB();

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
    console.log('The application is listening on port 3000!');
})

app.get('/', (req, res) => {
  res.send('Well done!');
})

// API endpoints for this application
app.post('/signup', auth.signUp)
app.post('/login', auth.login)
app.post('/subscribe', authMiddleware, digests.addDigest)
app.get('/userfeed', authMiddleware, digests.getDigest)
app.patch('/digest/subscribe', authMiddleware, digests.subscribeToDigest)
app.patch('/digest/unsubscribe', authMiddleware, digests.unsubscribeFromDigest)
app.patch('/digest/delete', authMiddleware, digests.removeDigest)

app.post('/signup', (req, res) => {
  console.log(req.body)

})

app.get('/news', (req, getRes) => {
  let keyword = req.query.keyword
  let source = req.query.source
  let topic = req.query.topic
  let newsResponse: NewsInfo[] = []

  axios
  .get(`https://newsapi.org/v2/everything?q=${keyword}&apiKey=${apiKey}`)
  .then((res:any) => {
    console.log(`statusCode: ${res.status}`)
    console.log(res.data.articles)
    let articles = res.data.articles
    articles.forEach((article: any) => {
      let stringDate = article.publishedAt
      let date = new Date(stringDate)
      let today = new Date();
      let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate()-7);
      if (today >= date && lastWeek <= date) {
        let newsObj: NewsInfo = {
          source: article.source.name,
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: 
            article.urlToImage == null 
            ? "https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
            : article.urlToImage,
          publishedAt: article.publishedAt
        }
        newsResponse.push(newsObj)
        // addDigest(newsObj)
      }
    });
    getRes.send(newsResponse);
  })
  .catch((error: any) => {
    console.error(error)
  })
})