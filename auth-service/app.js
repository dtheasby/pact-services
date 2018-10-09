const express = require('express');
const bodyParser = require('body-parser');
const authdb = require('./data/db').authdb;
const serviceConfig = require('../service-configs').authService
const app = express()
const httpServer = require('http').createServer(app);
const port = serviceConfig.port;
const { authenticateUser, createUserAuth } = require('./services.js');

app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/authenticateUser', async (req, res, next) => {
    const expectedProps = ['username', 'password'];
    try {
        verifyProps(req.body, expectedProps);
        console.log(`Authentication Request for user: ${req.body.username}`)
        const isAuth = await authenticateUser({ username: req.body.username, password: req.body.password });
        const response = { username: req.body.username, auth: isAuth };
        if (isAuth) {
            return res.status(200).json(response);
        } else {
            return res.status(401).json(response);
        }
    } catch (err) {
        console.log(`err: ${err}`)
        next(err)
    }
});

app.put('/createAuth', async (req, res, next) => {
    const expectedProps = ['username', 'password'];
    try {
        verifyProps(req.body, expectedProps);
        await createUserAuth({ username: req.body.username, password: req.body.password });
        return res.status(201).send();
    } catch (err) {
        console.log(`err: ${err}`)
        next(err)
    }
})

app.use(function (err, req, res, next) {
    console.log(`LOGGING CALLSTACK: ${err.stack}`);
    if (err.response) {
        res.status(err.response.status || 500).json({ "error": err.response.message });
    } else {
        res.status(500).json({ "error": 'Unknown Error' });
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
    await authdb.initialiseAuthDb();
    httpServer.listen(port, () => console.log(`Auth Service is listening on port ${port}!`))
}

function stopServer() {
    httpServer.close();
}

module.exports = { startServer, stopServer };