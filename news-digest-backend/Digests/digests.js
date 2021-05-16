"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var axios_1 = __importDefault(require("axios"));
var uuid_1 = require("uuid");
var AWS = require("aws-sdk");
var jwtExpiration = 3600;
AWS.config.update({
    region: "us-west-2" // replace with your region in AWS account
});
var DynamoDB = new AWS.DynamoDB.DocumentClient();
// login function
var addDigest = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var userObj, newsObj, subscriptionStatus, creationDate, apiRequest;
    return __generator(this, function (_a) {
        userObj = request.body.user;
        console.log(userObj);
        newsObj = request.body.news;
        subscriptionStatus = request.body.subscriptionStatus;
        creationDate = request.body.creationDate;
        apiRequest = "https://newsapi.org/v2/everything?q=" + newsObj.keyword + "&from='" + newsObj.startDate + "'0&to=" + newsObj.endDate + "0&sortBy=" + newsObj.sortBy + "&apiKey=" + process.env.NEWS_API_KEY;
        axios_1.default.get(apiRequest)
            .then(function (res) { return __awaiter(void 0, void 0, void 0, function () {
            var articles;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        articles = res.data.articles;
                        return [4 /*yield*/, addFeed(userObj, articles, subscriptionStatus, creationDate, newsObj.digestName, apiRequest)];
                    case 1:
                        _a.sent();
                        response.sendStatus(201);
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); };
function addFeed(userObj, articles, subscriptionStatus, creationDate, digestName, apiEndpoint) {
    return __awaiter(this, void 0, void 0, function () {
        var articleObj, i, id, params, userParams;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    articleObj = [];
                    for (i = 0; i < articles.length; i++) {
                        articleObj.push({
                            source: articles[i].source.name,
                            title: articles[i].title,
                            description: articles[i].description,
                            url: articles[i].url,
                            urlToImage: articles[i].urlToImage == null
                                ? "https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
                                : articles[i].urlToImage,
                            publishedAt: new Date(articles[i].publishedAt).toISOString().slice(0, 10)
                        });
                    }
                    id = uuid_1.v1();
                    params = {
                        TableName: "digests",
                        Item: {
                            "id": id,
                            "name": digestName,
                            "feed": articleObj,
                            "subscriptionStatus": subscriptionStatus,
                            "creationDate": creationDate,
                            "apiEndpoint": apiEndpoint
                        }
                    };
                    return [4 /*yield*/, DynamoDB.put(params, (function (err) {
                            if (err) {
                                console.error("Unable to add feed", err);
                                console.log(articleObj);
                            }
                            else {
                                console.log("Added all articles");
                            }
                        }))];
                case 1:
                    _a.sent();
                    console.log("Adding feed to users table");
                    console.log(userObj);
                    userParams = {
                        TableName: "users",
                        Key: { id: userObj.id },
                        UpdateExpression: "SET #digests = list_append(#digests, :feed)",
                        ExpressionAttributeNames: { "#digests": "digests" },
                        ExpressionAttributeValues: {
                            ":feed": [{
                                    feedID: id,
                                }]
                        },
                    };
                    return [4 /*yield*/, DynamoDB.update(userParams, (function (err) {
                            if (err) {
                                console.error("Unable to add feed to user", err);
                                console.log(articleObj);
                            }
                            else {
                                console.log("Added feed to user");
                            }
                        }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var getDigest = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var userID, digests, params, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userID = request.query.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                params = {
                    Key: {
                        "id": userID,
                    },
                    TableName: 'users',
                    ConsistentRead: true
                };
                return [4 /*yield*/, DynamoDB.get(params, function (err, data) { return __awaiter(void 0, void 0, void 0, function () {
                        var articles;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    digests = data.Item.digests;
                                    return [4 /*yield*/, getArticles(digests)];
                                case 1:
                                    articles = _a.sent();
                                    response.status(200).send(articles);
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error(error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var removeDigest = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var userID, digestID, userParams, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userID = request.body.userID;
                digestID = request.body.digestID;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                userParams = {
                    TableName: "users",
                    Key: { id: userID }
                };
                return [4 /*yield*/, DynamoDB.get(userParams, (function (err, data) {
                        if (err) {
                            console.error("Unable to get user", err);
                        }
                        else {
                            console.log("Got user info");
                            console.log(data);
                            removeFromDigestsTable(data.Item, digestID);
                            response.status(200);
                            response.send("Deleted");
                        }
                    }))];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error(error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var removeFromDigestsTable = function (userData, digestID) { return __awaiter(void 0, void 0, void 0, function () {
    var indexToBeDeleted, digestsList, i, digestParams, removalParams;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                indexToBeDeleted = 0;
                digestsList = userData.digests;
                for (i = 0; i < digestsList.length; i++) {
                    if (digestsList[i].feedID == digestID) {
                        indexToBeDeleted = i;
                        break;
                    }
                }
                digestParams = {
                    TableName: "users",
                    Key: { id: userData.id },
                    UpdateExpression: "REMOVE digests[" + indexToBeDeleted + "]",
                };
                return [4 /*yield*/, DynamoDB.update(digestParams, (function (err) {
                        if (err) {
                            console.error("Unable to remove digest from user", err);
                        }
                        else {
                            console.log("Removed digest from user");
                        }
                    }))];
            case 1:
                _a.sent();
                removalParams = {
                    TableName: 'digests',
                    Key: {
                        id: digestID
                    },
                };
                console.log("Attempting a conditional delete...");
                return [4 /*yield*/, DynamoDB.delete(removalParams, function (err, data) {
                        if (err) {
                            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                        }
                        else {
                            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                        }
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var subscribeToDigest = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var digestID, err, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                digestID = request.body.digestID;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, updateSubscriptionStatus(digestID, true)];
            case 2:
                err = _a.sent();
                if (!err)
                    response.status(201).send("Updated");
                else
                    response.status(500).send("Failed to update");
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error(error_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var unsubscribeFromDigest = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var digestID, err, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                digestID = request.body.digestID;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, updateSubscriptionStatus(digestID, false)];
            case 2:
                err = _a.sent();
                if (!err)
                    response.status(201).send("Updated");
                else
                    response.status(500).send("Failed to update");
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.error(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var updateSubscriptionStatus = function (digestID, status) { return __awaiter(void 0, void 0, void 0, function () {
    var digestParams;
    return __generator(this, function (_a) {
        digestParams = {
            TableName: "digests",
            Key: { id: digestID },
            UpdateExpression: "set #status = :newStatus",
            ExpressionAttributeNames: {
                "#status": "subscriptionStatus"
            },
            ExpressionAttributeValues: {
                ":newStatus": status,
            }
        };
        DynamoDB.update(digestParams, (function (err, data) {
            if (err) {
                console.error("Unable to remove digest from user", err);
            }
            else {
                console.log("Updated digest" + digestID + " 's subscription status to be " + status);
            }
            return err;
        }));
        return [2 /*return*/];
    });
}); };
var getArticles = function (digests) { return __awaiter(void 0, void 0, void 0, function () {
    var articles, i, params, result, feed, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                articles = [];
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < digests.length)) return [3 /*break*/, 6];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                params = {
                    Key: {
                        "id": digests[i].feedID,
                    },
                    TableName: 'digests',
                    ConsistentRead: true
                };
                return [4 /*yield*/, DynamoDB.get(params).promise()];
            case 3:
                result = _a.sent();
                feed = result.Item;
                articles.push(feed);
                return [3 /*break*/, 5];
            case 4:
                error_5 = _a.sent();
                console.error(error_5);
                return [3 /*break*/, 5];
            case 5:
                i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/, articles];
        }
    });
}); };
module.exports = {
    addDigest: addDigest,
    getDigest: getDigest,
    removeDigest: removeDigest,
    subscribeToDigest: subscribeToDigest,
    unsubscribeFromDigest: unsubscribeFromDigest
};
