let nedb = require('nedb');
let bcrypt = require('bcrypt');
let initialUsers = require('./initialUsers');
const SALT_ROUNDS = 10;

let authdb = (function () {
    let authdb;

    async function createDb() {
        console.log('Creating db...');
        authdb = new nedb();
        await initialiseUsers();
    }

    async function initialiseUsers() {
        console.log('Initialising users...');
        for (user of initialUsers) {
            let hashedPass = await bcrypt.hash(user.password, SALT_ROUNDS);
            await insertUserHash(user.username, hashedPass);
        };
    }

    async function insertUserHash(username, passwordHash) {
        console.log(`Inserting user: ${username}`);
        return new Promise((resolve, reject) => {
            authdb.insert({ "username": username, "passwordHash": passwordHash }, (err, result) => {
                if (err) { reject(err) }
                else { resolve(result) }
            });
        });
    };

    return {
        initialiseAuthDb: async function () {
            if (typeof authdb == 'undefined') {
                await createDb();
            }
        },
        createUserAuth: async function (username, hashedPassword) {
            if ((await this.findAuthByUser(username)).length > 0
                || (typeof username !== 'string' || username.length === 0)
                || (typeof hashedPassword !== 'string' || hashedPassword.lengh === 0)
                || !(await bcrypt.getRounds(hashedPassword) > 0)) {
                throw new Error(`Unable to create user, incorrect username or password. user:${username}`);
            } else {
                await insertUserHash(username, hashedPassword);
            }
        },
        findAuthByUser: async (username) => new Promise((resolve, reject) => {
            authdb.find({ username: username }, (err, result) => {
                if (err) { reject(err) }
                else { resolve(result) }
            });
        })
    }

})();

module.exports = { authdb }
