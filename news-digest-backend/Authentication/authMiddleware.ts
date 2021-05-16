const jwt = require('jsonwebtoken');

// middleware function to handle JWT verification for updating users and getting users
async function authMiddleware(req: any, res: any, next: any) { 
    console.log("In authentication middleware")
    
    // Extract the token from the request headers
    let token = req.headers["authorization"]
    let parts = token.split(' ');
    token = parts[1]
    console.log(token)
    
    if (token == null)
        return res.status(401).send('Unauthorized') 

    //Verify the input token 
    jwt.verify(token, process.env.JWT_SECRET, (err: any, jwtPayload: any) => {
        if (err) {
            console.log(err.message)
            res.status(401).send("Not authorized to perform this action")
        }
        else {
            // If token is verified, extract the user's email from the payload and call the next function
            req.email = jwtPayload.email
            console.log(`Found user email in JWT payload: ${req.email}`)
            next()
        }
    })
    
}

module.exports = {
    authMiddleware
}