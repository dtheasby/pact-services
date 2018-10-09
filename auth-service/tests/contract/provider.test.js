const { Verifier } = require('@pact-foundation/pact');
const authServiceConfig = require('../../../service-configs').authService;
const { startServer, stopServer } = require('../../app'); 

let pactClientServerOpts = {
    provider: 'Auth Service',
    consumer: 'User Service',
    tags: ['prod', 'test'],
    providerBaseUrl: 'http://localhost:' + authServiceConfig.port,
    pactBrokerUrl: 'http://localhost:8080/',
}

describe('Verify the Auth Service', () => {
    beforeAll(async () => {
        await startServer();
    })

    it('Should respond to the pact server with response matching those saved', async() => {
        let verifier = new Verifier();
        await verifier.verifyProvider(pactClientServerOpts);
    }, 50000)

    afterAll(() => {
        stopServer();
    })
})
