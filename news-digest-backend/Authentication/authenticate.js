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
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var uuid_1 = require("uuid");
var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2" // replace with your region in AWS account
});
var DynamoDB = new AWS.DynamoDB.DocumentClient();
var jwtExpiration = 3600;
var signUp = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, firstName, lastName, email, password, emailFormat, hashedPassword, userObj, user;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = request.body, firstName = _a.firstName, lastName = _a.lastName, email = _a.email, password = _a.password;
                console.log("Signing up " + email + " now...");
                // Validating input
                if (!firstName || !lastName || !email || !password)
                    return [2 /*return*/, response.status(400).send("Please include all fields")];
                emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailFormat.test(email))
                    return [2 /*return*/, response.status(400).send("Please Enter a valid email")];
                return [4 /*yield*/, hashPassword(password)];
            case 1:
                hashedPassword = _b.sent();
                userObj = {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hashedPassword
                };
                return [4 /*yield*/, addUser(userObj)];
            case 2:
                user = _b.sent();
                if (!user)
                    return [2 /*return*/, response.status(500).send("An error has occured")];
                response.status(201).send(user);
                return [2 /*return*/];
        }
    });
}); };
var login = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    function onScan(err, data) {
        if (err) {
            console.error("Unable to get user:", JSON.stringify(err, null, 2));
        }
        else {
            console.log("Gpt all users");
            data.Items.forEach(function (user) {
                if (user.email == email) {
                    console.log("Email found: " + user.email);
                    loggedInUser.user = {
                        id: user.id,
                        firstName: user.firstName,
                        lastname: user.lastName,
                        email: user.email
                    };
                    authenticate(user.password);
                }
            });
            // continue scanning if we have more users, because
            // scan can retrieve a maximum of 1MB of data
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more users...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                DynamoDB.scan(params, onScan);
            }
        }
    }
    function authenticate(userPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var isAuthenticated, token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Makes sure the user has entered the correct password to obtain the token
                        console.log(userPassword);
                        return [4 /*yield*/, checkPassword(userPassword, password)];
                    case 1:
                        isAuthenticated = _a.sent();
                        if (isAuthenticated) {
                            token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
                                algorithm: "HS256",
                                expiresIn: jwtExpiration,
                            });
                            console.log("Login successful!");
                            loggedInUser.token = token;
                            response.status(200).send(loggedInUser);
                        }
                        else
                            response.status(401).send("Incorrent email/password");
                        return [2 /*return*/];
                }
            });
        });
    }
    var _a, email, password, loggedInUser, emailFormat, params, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = request.body, email = _a.email, password = _a.password;
                console.log("Logging in " + email + " now");
                loggedInUser = {};
                // Validating input
                if (!email || !password)
                    return [2 /*return*/, response.status(400).send("Please include all fields")];
                emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailFormat.test(email))
                    return [2 /*return*/, response.status(400).send("Please Enter a valid email")];
                params = {
                    TableName: "users",
                    FilterExpression: 'email = :email',
                    ExpressionAttributeValues: {
                        ":email": email
                    },
                    ExclusiveStartKey: null
                };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, DynamoDB.scan(params, onScan)];
            case 2:
                _b.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _b.sent();
                console.log("Error occurred querying for users");
                console.log(e_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// Creates a hashed password with added salt
// This ensures that even when two users choose the same password, their hashes would be different
var hashPassword = function (password) { return __awaiter(void 0, void 0, void 0, function () {
    var salt, hash;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bcrypt.genSalt()];
            case 1:
                salt = _a.sent();
                return [4 /*yield*/, bcrypt.hash(password, salt)];
            case 2:
                hash = _a.sent();
                console.log("Password is hashed");
                return [2 /*return*/, hash];
        }
    });
}); };
// Helper function to check the authenticity of an entered password
var checkPassword = function (dbPassword, loginPassword) { return __awaiter(void 0, void 0, void 0, function () {
    var match;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bcrypt.compare(loginPassword, dbPassword)];
            case 1:
                match = _a.sent();
                console.log(loginPassword);
                console.log(dbPassword);
                return [2 /*return*/, match];
        }
    });
}); };
var addUser = function (userObj) { return __awaiter(void 0, void 0, void 0, function () {
    var id, params, error_1, token, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = uuid_1.v1();
                params = {
                    TableName: "users",
                    Item: {
                        "id": id,
                        "firstName": userObj.firstName,
                        "lastName": userObj.lastName,
                        "email": userObj.email,
                        "password": userObj.password,
                        "digests": []
                    }
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, DynamoDB.put(params, (function () {
                        console.log("Added " + userObj);
                    }))];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                return [2 /*return*/];
            case 4:
                token = jwt.sign({ email: userObj.email }, process.env.JWT_SECRET, {
                    algorithm: "HS256",
                    expiresIn: jwtExpiration,
                });
                console.log("Sign up successful!");
                result = {
                    token: token,
                    user: {
                        id: id,
                        firstName: userObj.firstName,
                        lastName: userObj.lastName,
                        email: userObj.email,
                    }
                };
                return [2 /*return*/, result];
        }
    });
}); };
module.exports = {
    signUp: signUp,
    login: login,
};
