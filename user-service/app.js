const express = require('express')
const bodyParser = require('body-parser');
const db = require('./data/userDatabase').userDb;
const { getUsers, loginUser, createUser } = require('./service');
const serviceConfig = require('../service-configs.js').userService

const app = express()
const httpServer = require('http').createServer(app);
const port = serviceConfig.port;


app.use(bodyParser.json());
app.use(function (req, res, next) {
    console.log(`\nRecieved request for ${req.originalUrl}`)
    if (req.body) {
        console.log(`\nWith body: ${JSON.stringify(req.body)}`);
    }
    next();
})

app.get('/', (req, res) => res.send('User Service Is Up'));
app.get('/getUsers', async (req, res, next) => {
    try {
        const users = await getUsers();
        console.log(users)
        return res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

app.post('/loginUser', async (req, res, next) => {
    const loginProperties = ['username', 'password'];

    try {
        verifyProps(req.body, loginProperties);
        console.log(`Logging in user: ${req.body.username}`)
        let loginResponse = await loginUser({ username: req.body.username, password: req.body.password});

        if (loginResponse.auth === true) {
            console.log(`${loginResponse.username} logged in. Session created: ${loginResponse.session}`)
            return res.status(200).json(loginResponse);
        } else if(loginResponse.auth === false ) {
            console.log(`Unable to authenticate user: ${JSON.stringify(loginResponse)}`)
            return res.status(401).json({message: 'Incorrect username or password'})
        } else {
            throw('Unable to login')
        }
    } catch (err) {
        next(err)
    }
});

app.put('/createUser', async (req, res, next) => {
    const createBody = ['username', 'firstname', 'lastname', 'profile', 'password'];
    try {
        console.log(req.body);
        verifyProps(req.body, createBody)
        await createUser(req.body);
        return res.status(201).send();
    } catch (err) {
        next(err);
    }
});

app.use(function (err, req, res, next) {
    console.log(`LOGGING CALLSTACK: ${err.stack}`);
    if(err.response) {
        res.status(err.response.status || 500).json({ "error": err.response.message });
    } else {
        res.status(500).json({"error": 'Unknown Error'});
    }
});

function verifyProps(requestBody, expectedProperties) {
    let bodyProps = Object.getOwnPropertyNames(requestBody);
    for (prop of bodyProps) {
        if (requestBody[prop].length === 0 || !expectedProperties.includes(prop) || bodyProps.length !== expectedProperties.length) {
            let error = new Error(`${prop} is not defined or incorrect`);
            error.response = { message: `Incorrect message format`, status: 400 };
            throw error;
        }
    }
}

async function startServer() {
    await db.initiliseDb();
    httpServer.listen(port, () => console.log(`User Service is listening on port ${port}!`))
}

function stopServer() {
    httpServer.close();
}

module.exports = { startServer, stopServer };