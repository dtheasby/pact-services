let bcrypt = require('bcrypt');
let authdb = require('./data/db').authdb;
const SALT_ROUNDS = 10;

async function authenticateUser({ username, password }) {
    const userData = (await authdb.findAuthByUser(username));
    if (userData.length === 0) {
        const error = new Error(`Unable to authenticate user, ${username} doesn't exist`)
        error.response = { status: 400, message: 'Unable to authenticate user' };
        throw error;
    }
    const isAuth = await bcrypt.compare(password, userData[0].passwordHash)
    return isAuth
}

async function createUserAuth({ username, password }) {
    const matchingUsers = await authdb.findAuthByUser(username)
    if (matchingUsers.length !== 0) {
        const error = new Error(`Unable to create user, user ${username} already exists`)
        error.response = { status: 400, message: 'Unable to create user' };
        throw error;
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await authdb.createUserAuth(username, hashedPassword);
}

module.exports = { authenticateUser, createUserAuth };