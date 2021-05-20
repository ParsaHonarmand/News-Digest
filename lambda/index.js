const AWS = require("aws-sdk")
const axios = require("axios")

AWS.config.update({
    region: "us-west-2"
});
const ses = new AWS.SES({ region: "us-west-2" });

const DynamoDB = new AWS.DynamoDB.DocumentClient();

console.log('Loading function');

exports.handler = async (event, context) => {
    try {
        const users = await getUsers();
        if (!users) return
        for (let i=0; i<users.length; i++) {
            console.log(`Processing for user: ${JSON.stringify(users[i].email)}`)
            for (let j=0; j<users[i].digests.length; j++) {
                const {apiEndpoint, feedID, subscriptionStatus} = await getDigestsInfo(users[i].digests[j]);
                if (feedID === "") continue
                const {articles, name} = await generateNewDigest(feedID, apiEndpoint);
                if (articles.length === 0) continue;
                if (!subscriptionStatus) continue;
                const result = await sendEmail(users[i].firstName, users[i].email, name, articles)
            }
        }
        return "Done"
    } catch (error) {
        console.log("Failed: " + error);
    }
};

const getUsers = async () => {
    console.log("Getting users' info")
    let users;
    const params = {
        TableName: "users"
    };
    try {
        const result = await DynamoDB.scan(params).promise();
        users = result.Items;
        console.log("All users' data collected")
        return users    
    } catch (error) {
        console.log("Error occured while getting all users" + error)
        return null
    }
};

const getDigestsInfo = async (digest) => {
    console.log(`Getting Digest info for ${digest.feedID}`)
    let apiEndpoint = ""
    let feedID = ""
    let subscriptionStatus = false;

    const params = {
        Key: {
         "id": digest.feedID, 
        }, 
        TableName: 'digests'
    };

    try {
        const result = await DynamoDB.get(params).promise();
        subscriptionStatus = result.Item.subscriptionStatus
        apiEndpoint = result.Item.apiEndpoint;
        feedID = result.Item.id;
    } catch (error) {
        console.log("Error occured while getting digest: " + err);
    }

    return {
        apiEndpoint: apiEndpoint,
        feedID: feedID,
        subscriptionStatus: subscriptionStatus
    }
};

const generateNewDigest = async (feedID, apiEndpoint) => {
    console.log(`Getting new digest for ${feedID}`)
    let articleObj = [];
    let digestName = "";

    try {
        let res = await axios.get(apiEndpoint);
        let articles = res.data.articles;

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
            });
        }

        console.log(`Generating new digest for ${feedID}`)
        const params = {
            TableName: "digests",
            Key:{
                id: feedID
            },
            UpdateExpression: "set feed = :newFeed",
            ExpressionAttributeValues:{
                ":newFeed": articleObj,
            }
        };

        const result = await DynamoDB.update(params).promise();
        console.log("UpdateItem succeeded:", JSON.stringify(result, null, 2));

        const getParams = {
            TableName: "digests",
            Key: {
                id: feedID
            }
        };
        const getResult = await DynamoDB.get(getParams).promise();
        digestName = getResult.Item.name
    } catch(err) {
        console.log("ERROR: " + err)
    }
    return { articles: articleObj, name: digestName}
};

const sendEmail = async (firstName, emailAddress, digestName, feed) => {
    let data = ""
    data += `<html><body><h2>Hi ${firstName}! Here is your weekly feed for ${digestName}</h2><ul>`
    feed.forEach(element => {
        data += `<li>${element.publishedAt} - <a href="${element.url}" target="_blank">${element.title}</a></li>`
    });
    data += "</ul></body></html>"

    const params = {
        Destination: {
            ToAddresses: [emailAddress],
        },
        Message: {
            Body: {
                Html: { Data: data }
            },
            Subject: { Data: `Weekly Digest for ${digestName}!` },
        },
        Source: "parsasnewsdigest@gmail.com",
    };

    const result = await ses.sendEmail(params).promise()
    console.log("Email sent to " + emailAddress)
    return result
}
