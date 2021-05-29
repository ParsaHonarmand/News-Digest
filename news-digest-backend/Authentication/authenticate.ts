require('dotenv').config()
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import { v1 as uuidv1 } from 'uuid';
const AWS = require("aws-sdk")

AWS.config.update({
    region: "us-west-2" // replace with your region in AWS account
});
const DynamoDB = new AWS.DynamoDB.DocumentClient();

const jwtExpiration = 3600

interface User {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const signUp = async (request:any, response:any) => {
    const { firstName, lastName, email, password } = request.body
    console.log(`Signing up ${email} now...`)

    // Validating input
    if (!firstName || !lastName || !email || !password) 
        return response.status(400).send("Please include all fields")

    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailFormat.test(email))
        return response.status(400).send("Please Enter a valid email")

    let hashedPassword = await hashPassword(password);

    const userObj:User = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword
    }

    const params = {
        TableName: "users",
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ":email": email
        },
        ExclusiveStartKey: null
    }

    let emailExists = false;

    function onScan (err: any, data: any) {
        if (err) {
            console.error("Unable to get user:", JSON.stringify(err, null, 2));
            return response.status(500)
        } else {
            console.log("Got all users");
            data.Items.every((user: any) => {
               if (user.email == email) {
                   console.log(`Email Exists: ${user.email}`)
                   emailExists = true
                   return false
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

    try {
        const res = await DynamoDB.scan(params, onScan).promise()
        if (emailExists) {
            return response.status(400).send("Email already exists")
        }
        let user = await addUser(userObj)
        if (!user)
            return response.status(500).send("An error has occured")
    
        response.status(201).send(user)
    } catch (error) {
        console.log("Error occurred querying for users");
        console.log(error)
    }
}


const login = async (request:any, response:any) => {
    const { email, password } = request.body
    console.log(`Logging in ${email} now`)

    let loggedInUser: any = {}
    // Validating input
    if (!email || !password)
        return response.status(400).send("Please include all fields")

    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailFormat.test(email))
        return response.status(400).send("Please Enter a valid email")

    const params = {
        TableName: "users",
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ":email": email
        },
        ExclusiveStartKey: null
    }

    function onScan (err: any, data: any) {
        if (err) {
            console.error("Unable to get user:", JSON.stringify(err, null, 2));
            return response.status(500)
        } else {
            console.log("Got all users");
            data.Items.forEach((user: any) => {
               if (user.email == email) {
                   console.log(`Email found: ${user.email}`)

                   loggedInUser.user = {
                       id: user.id,
                       firstName: user.firstName,
                       lastname: user.lastName,
                       email: user.email
                   }
                   authenticate(user.password)
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

    try {
        await DynamoDB.scan(params, onScan)
    }catch (e) {
        console.log("Error occurred querying for users");
        console.log(e);
    }

    async function authenticate(userPassword: string) {
        // Makes sure the user has entered the correct password to obtain the token
        console.log(userPassword)
        let isAuthenticated = await checkPassword(userPassword, password)
        if (isAuthenticated) {
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
                algorithm: "HS256",
                expiresIn: jwtExpiration,
            })
            console.log("Login successful!")
            loggedInUser.token = token
            response.status(200).send(loggedInUser)
        }
        else
            response.status(401).send("Incorrent email/password")
    }
}

// Creates a hashed password with added salt
// This ensures that even when two users choose the same password, their hashes would be different
const hashPassword = async (password:string) => {
	const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, salt)
    console.log("Password is hashed")
    return hash
}

// Helper function to check the authenticity of an entered password
const checkPassword = async (dbPassword:string, loginPassword:string) => {
    const match = await bcrypt.compare(loginPassword, dbPassword)
    console.log(loginPassword)
    console.log(dbPassword)
    return match
}

const addUser = async (userObj: User) => {
    const id = uuidv1()
    const params = {
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
  
    try {
        await DynamoDB.put(params, (() => { 
            console.log(`Added ${userObj}`) 
        }));
    } catch (error) {
        return 
    }
    
    // Create JWT and send to user
    let token = jwt.sign({ email: userObj.email }, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: jwtExpiration,
    })

    console.log("Sign up successful!")

    let result = {
        token: token,
        user: {
            id: id,
            firstName: userObj.firstName,
            lastName: userObj.lastName,
            email: userObj. email,
        }
    }
    return result
}

module.exports = {
    signUp,
    login,
};