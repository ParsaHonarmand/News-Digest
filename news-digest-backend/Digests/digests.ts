require('dotenv').config()
import axios from 'axios';
import { v1 as uuidv1 } from 'uuid';
const AWS = require("aws-sdk")

AWS.config.update({
    region: "us-west-2" // replace with your region in AWS account
});
const DynamoDB = new AWS.DynamoDB.DocumentClient();

interface NewsInfo {
    source: {
        id: string,
        name: string
    };
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
}
interface Digest {
    name?: string;
    creationDate: string;
    feedID: string;
    subscriptionStatus: string;
}

const addDigest = async (request:any, response:any) => {
    let userObj = request.body.user
    let newsObj = request.body.news
    let subscriptionStatus = request.body.subscriptionStatus
    let creationDate = request.body.creationDate
    
    console.log(`Adding digest for ${userObj.email}`)

    let apiRequest = `https://newsapi.org/v2/everything?q=${newsObj.keyword}&from='${newsObj.startDate}'0&to=${newsObj.endDate}0&sortBy=${newsObj.sortBy}&apiKey=${process.env.NEWS_API_KEY}`
    
    axios.get(apiRequest)
        .then(async (res:any) => {
            let articles = res.data.articles

            await addFeed(userObj, articles, subscriptionStatus, creationDate, newsObj.digestName, apiRequest)
            response.sendStatus(201)
        })
}

async function addFeed(userObj: any, articles:any, subscriptionStatus: boolean, creationDate: string, digestName: string, apiEndpoint: string) {
    let articleObj: NewsInfo[] = []
    for (let i=0; i<articles.length; i++) {
        articleObj.push({
            source: articles[i].source.name,
            title: articles[i].title,
            description: articles[i].description,
            url: articles[i].url,
            urlToImage: 
                articles[i].urlToImage == null 
                ? "https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
                : articles[i].urlToImage,
            publishedAt: new Date(articles[i].publishedAt).toISOString().slice(0,10)
        })
    }

    const id = uuidv1()
    const params = {
      TableName: "digests",
      Item: {
        "id": id,
        "name": digestName,
        "feed": articleObj,
        "subscriptionStatus": subscriptionStatus,
        "creationDate": creationDate,
        "apiEndpoint": apiEndpoint
      }
    }
  
    await DynamoDB.put(params, ((err: any) => {
      if (err) {
        console.error("Unable to add feed", err);
        console.log(articleObj)
      } else {
        console.log(`Added all articles`);
      }
    }));

    console.log("Adding feed to users table")
    console.log(userObj)
    let userParams = {
        TableName: "users",
        Key: { id: userObj.id },
        UpdateExpression: "SET #digests = list_append(#digests, :feed)",
        ExpressionAttributeNames: { "#digests": "digests" },
        ExpressionAttributeValues: {
            ":feed": [{
                feedID: id,
            }]
        },
    }

    await DynamoDB.update(userParams, ((err:any) => {
        if (err) {
            console.error("Unable to add feed to user", err);
            console.log(articleObj)
        } else {
            console.log(`Added feed to user`);
        } 
    }))
}

const getDigest = async (request:any, response:any) => {
    let userID = request.query.id
    let digests:Digest[]
    try {
        const params = {
            Key: {
             "id": userID, 
            }, 
            TableName: 'users',
            ConsistentRead: true
        };
        await DynamoDB.get(params, async (err: any, data: any) => {
            digests = data.Item.digests
    
            let articles = await getArticles(digests)
            response.status(200).send(articles)
        })
    } catch (error) {
        console.error(error);
    }
}

const removeDigest = async (request:any, response:any) => {
    let userID = request.body.userID
    let digestID = request.body.digestID
    
    try {
        let userParams = {
            TableName: "users",
            Key: { id: userID }
        }
    
        await DynamoDB.get(userParams, ((err:any, data:any) => {
            if (err) {
                console.error("Unable to get user", err);
            } else {
                console.log(`Got user info`);
                console.log(data)
                removeFromDigestsTable(data.Item, digestID)
                response.status(200)
                response.send("Deleted")
            } 
        }))
    } catch (error) {
        console.error(error);
    }
}

const removeFromDigestsTable = async (userData: any, digestID: string) => {
    let indexToBeDeleted = 0;
    let digestsList = userData.digests

    for (let i=0; i<digestsList.length; i++) {
        if (digestsList[i].feedID == digestID) {
            indexToBeDeleted = i;
            break;
        }
    }

    let digestParams = {
        TableName: "users",
        Key: { id: userData.id },
        UpdateExpression: `REMOVE digests[${indexToBeDeleted}]`,
    }

    await DynamoDB.update(digestParams, ((err:any) => {
        if (err) {
            console.error("Unable to remove digest from user", err);
        } else {
            console.log(`Removed digest from user`);
        } 
    }))

    let removalParams = {
        TableName: 'digests',
        Key:{
            id: digestID
        },
    };
    
    console.log("Attempting a conditional delete...");
    await DynamoDB.delete(removalParams, (err: any, data:any) => {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

const subscribeToDigest = async (request:any, response:any) => {
    let digestID = request.body.digestID

    try {
        let err:any = await updateSubscriptionStatus(digestID, true)
        if (!err) 
            response.status(201).send("Updated")
        else 
            response.status(500).send("Failed to update")
    } catch (error) {
        console.error(error);
    }
}

const unsubscribeFromDigest = async (request:any, response:any) => {
    let digestID = request.body.digestID

    try {
        let err:any = await updateSubscriptionStatus(digestID, false)
        if (!err) 
            response.status(201).send("Updated")
        else 
            response.status(500).send("Failed to update")
    } catch (error) {
        console.error(error);
    }
}

const updateSubscriptionStatus = async (digestID: string, status: boolean) => {
    let digestParams = {
        TableName: "digests",
        Key: { id: digestID },
        UpdateExpression: `set #status = :newStatus`,
        ExpressionAttributeNames: {
            "#status": "subscriptionStatus"
        },
        ExpressionAttributeValues: {
            ":newStatus": status,
        }
    }

    DynamoDB.update(digestParams, ((err:any, data: any) => {
        if (err) {
            console.error("Unable to remove digest from user", err);
        } else {
            console.log(`Updated digest${digestID} 's subscription status to be ${status}`);
        } 
        return err
    }))
}

const getArticles = async (digests: any) => {
    let articles: NewsInfo[] = []
    for (let i = 0; i < digests.length; i++) {
        try {
            var params = {
                Key: {
                 "id": digests[i].feedID, 
                }, 
                TableName: 'digests',
                ConsistentRead: true
            };
            let result = await DynamoDB.get(params).promise()
            let feed = result.Item
            if (feed)
                articles.push(feed)
        } catch (error) {
            console.error(error);
        } 
    }
    return articles
}

module.exports = {
    addDigest,
    getDigest,
    removeDigest,
    subscribeToDigest,
    unsubscribeFromDigest
};