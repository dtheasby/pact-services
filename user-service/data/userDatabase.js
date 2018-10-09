const nedb = require('nedb');
const defaultUsers = require('./users');
const initialDataFile = './userdb.db'

const userDb = (function () {
    let db;

    async function createDb() {
        console.log('creating db...')
        db = new nedb()
        await addDefaultUsers();
    }

    async function addDefaultUsers() {
        for (user of defaultUsers) {
            await insertUser(user)
        }
    }

    async function insertUser(user) {
        return new Promise((resolve, reject) => {
            console.log(`Inserting user: ${user.username}`)
            db.insert(user, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    console.log(`inserted user ${user.username}`)
                    resolve(result)
                }
            });
        })
    }

    return {
        initiliseDb: async function () {
            if (typeof db == 'undefined') {
                await createDb();
            }
        },
        getUsers: () =>
            new Promise((resolve, reject) => {
                db.find({ username: /\S?/g }, function (err, docs) {
                    if (err) { reject(err) }
                    else { resolve(docs); }
                });
            }),
        findUser: (username) =>
            new Promise((resolve, reject) => {
                db.find({ username: username }, function (err, result) {
                    if (err) { reject(err); }
                    else { resolve(result); }
                })
            }),
        insertUser: async (username, firstname, lastname, profile) => {
            if (username.length > 0
                && firstname.length > 0 
                && lastname.length > 0
                && profile.length > 0
                ) {
                let userResult;
                try {
                    userResult = await insertUser({
                        username: username,
                        firstname: firstname,
                        lastname: lastname,
                        profile: profile
                    })
                } catch (err) {
                    throw (`Unable to create user: ${err}`);
                }
                return userResult
            } else {
                throw ('Could not create user; Invalid user data.')
            }
        }
    }
})();

module.exports = { userDb }