const pact = require('@pact-foundation/pact-node')
const path = require('path');

const opts = {
    pactFilesOrDirs: [path.resolve(__dirname, './pacts/')],
    pactBroker: 'http://localhost:8080',
    tags: ['prod', 'test'],
    consumerVersion: '1.0.0'
}

console.log(path.resolve(__dirname, './pacts/'));
pact.publishPacts(opts)