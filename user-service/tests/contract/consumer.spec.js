const path = require('path')
const { Pact } = require('@pact-foundation/pact')
const authApi = require('../../external/api');
const { authService } = require('../../external/requests');
const { loginUser, createUser } = require('../../service');
const db = require('../../data/userDatabase').userDb;
const authServiceConfig = require('../../../service-configs').authService;
const MOCK_SERVER_PORT = authServiceConfig.port;

describe("Pact", () => {

    const provider = new Pact({
        consumer: "User Service",
        provider: "Auth Service",
        port: MOCK_SERVER_PORT,
        log: path.resolve(process.cwd(), "logs", "pact.log"),
        dir: path.resolve(process.cwd(), "pacts"),
        logLevel: "INFO",
        spec: 2
    });

    const MOCK_BODY = {
        validUser: {
            "username": "hsimpson",
            "password": "d0h!"
        },
        invalidUser: {
            "username": "hsimpson",
            "password": "incorrect password"
        },
        validCreateUser: {
            "username":"newUser",
            "password":"newUserPassword"
        }
    }

    const EXPECTED_BODY = {
        validUser: {
            "username": "hsimpson",
            "auth": true
        },
        invalidUser: {
            "username": "hsimpson",
            "auth": false
        },
        validCreateUser: {
            "username":"newUser",
            "password":"newUserPassword"
        }
    };

    const interactions = {
        validAuthInteraction: {
            state: "There are valid users",
            uponReceiving: "a request to authenticate a valid user",
            withRequest: {
                method: "POST",
                path: `/${authApi.auth_endpoints.authenticateUser}`,
                headers: {
                    "Content-Type": "application/json"
                },
                body: MOCK_BODY.validUser
            },
            willRespondWith: {
                status: 200,
                body: EXPECTED_BODY.validUser
            }
        },
        invalidAuthInteraction: {
            state: "There are valid users",
            uponReceiving: "a request to authenticate an valid user with an invalid password",
            withRequest: {
                method: "POST",
                path: `/${authApi.auth_endpoints.authenticateUser}`,
                headers: {
                    "Content-Type": "application/json"
                },
                body: MOCK_BODY.invalidUser
            },
            willRespondWith: {
                status: 401,
                body: EXPECTED_BODY.invalidUser
            }
        },
        createUserInteraction: {
            state: "There are valid users",
            uponReceiving: "a request to create a valid user",
            withRequest: {
                method: "PUT",
                path: `/${authApi.auth_endpoints.createAuth}`,
                headers: {
                    "Content-Type": "application/json"
                },
                body: MOCK_BODY.validCreateUser
            },
            willRespondWith: {
                status: 201,
            }
        }
    }

    describe(" ", () => {
        beforeAll(async () => {
            await provider.setup();
        });

        it("Responds with the expected message when requesting user authentication for a valid user", async () => {
            await provider.addInteraction(interactions.validAuthInteraction);
            let authResponse = await authService.authenticateUser(MOCK_BODY.validUser.username, MOCK_BODY.validUser.password);
            expect(authResponse.username).toEqual(MOCK_BODY.validUser.username);
            expect(authResponse.auth).toEqual(true)
        });

        it("Responds with the expected message when requesting user authentication for an invalid user", async () => {
            await provider.addInteraction(interactions.invalidAuthInteraction);
            let authResponse = await authService.authenticateUser(MOCK_BODY.invalidUser.username, MOCK_BODY.invalidUser.password);
            console.log(authResponse)
            expect(authResponse.username).toEqual(MOCK_BODY.invalidUser.username);
            expect(authResponse.auth).toEqual(false)
        });

        it('is possible to test the user login function', async () => {
            await provider.addInteraction(interactions.validAuthInteraction);
            await db.initiliseDb();
            const loginResponse = await loginUser(MOCK_BODY.validUser.username, MOCK_BODY.validUser.password);
            expect(loginResponse.username).toEqual(MOCK_BODY.validUser.username);
            expect(loginResponse.auth).toEqual(true);
            expect(loginResponse.session).toMatch(/[0-9]{8}/);
        })

        it('is possible to test the create user function', async () => {
            const newUser = {
                username: "newUser",
                firstname: "new",
                lastname: "User",
                profile: "profile for a new user",
                password: "newUserPassword"
            }
            await provider.addInteraction(interactions.createUserInteraction);
            await db.initiliseDb();
            await createUser(newUser)
            const dbUser = await db.findUser(newUser.username);
            expect(dbUser[0].profile).toEqual(newUser.profile)
        })

        afterEach(async () => {
            await provider.verify();
            await provider.removeInteractions();
        });

        afterAll(async () => {
            return await provider.finalize();
        });
    });
});