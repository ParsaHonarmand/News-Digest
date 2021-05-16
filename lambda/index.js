const AWS = require("aws-sdk")
const axios = require("axios")

AWS.config.update({
    region: "us-west-2" // replace with your region in AWS account
});
const ses = new AWS.SES({ region: "us-west-2" });

const DynamoDB = new AWS.DynamoDB.DocumentClient();

console.log('Loading function');

exports.handler = async (event, context) => {
    try {
        const users = await getUsers();
        for (let i=0; i<users.length; i++) {
            console.log(`Processing for user: ${JSON.stringify(users[i].email)}`)
            for (let j=0; j<users[i].digests.length; j++) {
                const {apiEndpoint, feedID} = await getDigestsInfo(users[i].digests[j]);
                const articleObj = await generateNewDigest(feedID, apiEndpoint);
                const result = await sendEmail(users[i].email, articleObj)
            }
        }
        return "HELLO"
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
    await DynamoDB.scan(params, async (err, data) => {
        if (err) {
            console.log("Error occured: " + err);
            return;
        }
        users = data.Items;
    }).promise();

    console.log("All users' data collected")
    return users
};

const getDigestsInfo = async (digest) => {
    console.log(`Getting Digest info for ${digest.feedID}`)
    let apiEndpoint = ""
    let feedID = ""

    const params = {
        Key: {
         "id": digest.feedID, 
        }, 
        TableName: 'digests',
        // ConsistentRead: true
    };
    await DynamoDB.get(params, async (err, data) => {
        if (err) {
            console.log(err);
        }
        // console.log(data)
        apiEndpoint = data.Item.apiEndpoint;
        feedID = data.Item.id;
    }).promise();

    return {
        apiEndpoint: apiEndpoint,
        feedID: feedID
    }
};

const generateNewDigest = async (feedID, apiEndpoint) => {
    try {
        console.log(`Getting new digest for ${feedID}`)

        let res = await axios.get(apiEndpoint);
        let articles = res.data.articles;
        let articleObj = [];

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

        await DynamoDB.update(params, async (err, data) => {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
            }
        }).promise();

        return articleObj
    } catch(err) {
        console.log("ERROR: " + err)
    }
};

const sendEmail = async (emailAddress, feed) => {
    const params = {
        Destination: {
          ToAddresses: [emailAddress],
        },
        Message: {
          Body: {
            Text: { Data: JSON.stringify(feed) },
          },
    
          Subject: { Data: "Test Email" },
        },
        Source: "parsa.honarmand@gmail.com",
    };

    console.log("Sending Email to " + emailAddress)
    const result = await ses.sendEmail(params).promise()
    console.log("Email sent to " + emailAddress)
    return result
}
