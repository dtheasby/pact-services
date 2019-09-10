const userdb = require('./data/userDatabase').userDb
const { authService } = require('./external/requests');

async function getUsers() {
    let users = [];
    try {
        let userResults = await userdb.getUsers();
        if (userResults.length > 0) {
            for (result of userResults) {
                console.log(result)
                users.push({
                    username: result.username,
                    firstame: result.firstname,
                    lastname: result.lastname,
                    profile: result.profile
                })
            }
        }
    } catch (err) {
        console.log(`error getting all users: ${err}`)
    }
    return users;
}

async function loginUser({ username, password }) {
    let response = { username: username, auth: false, session: null }
    let userData = await userdb.findUser(username);
    console.log(`USERDATE: ${JSON.stringify(userData)}`);
    let authResponse = await authService.authenticateUser({ username, password });
    console.log(`AUTHRESPONSE: ${JSON.stringify(authResponse)}`);
    if(authResponse.auth) {
        return {...authResponse, ...userData, session: createSession()}
    } else {
        return authResponse
    }
}

function createSession() {
    return JSON.stringify(Math.floor(Math.random() * 9000000000) + 1000000000)
}

async function createUser({ username, firstname, lastname, profile, password }) {
    try {
        await authService.createAuth({ username, password });
        await userdb.insertUser(username, firstname, lastname, profile)
    } catch (err) {
        console.log(err);
        throw "Unable to create user"
    }
};

module.exports = { getUsers, loginUser, createUser, createSession };
