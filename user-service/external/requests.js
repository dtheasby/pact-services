let request = require('request-promise-native');
let api = require('./api');

const authService = {
    authenticateUser: async function ({username, password}) {
        console.log(`Sending authentication request for user: ${username}`)
        let opts = {
            simple: false,
            resolveWithFullResponse: true,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            json: true,
            uri: `http://${api.auth_service_base_url}:${api.auth_service_port}/${api.auth_endpoints.authenticateUser}`,
            body: {
                username: username,
                password: password
            }
        };
        const response = await request(opts);
        console.log(response.statusCode);
        console.log(`Received Authentication Response from Auth Service: ${JSON.stringify(response)}`)
        if(response.statusCode === 200 || response.statusCode === 401) {
            return response.body
        } else {
            throw Error('Error authenticating user')
        }
    },
    createAuth: async function ({username, password}) {
        console.log(`Sending create auth request for user: ${username}`);
        let opts = {
            simple: false,
            resolveWithFullResponse: true,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            json: true,
            uri: `http://${api.auth_service_base_url}:${api.auth_service_port}/${api.auth_endpoints.createAuth}`,
            body: {
                username: username,
                password: password
            }
        };
        const response = await request(opts);
        if(!response.statusCode === 201) {
            throw Error('Error Creating User Auth')
        }
    }
};

module.exports = { authService };