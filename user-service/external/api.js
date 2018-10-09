const authServiceConfig = require('../../service-configs').authService

module.exports = {
    auth_service_base_url: 'localhost',
    auth_service_port: authServiceConfig.port,
    auth_endpoints: {
        authenticateUser: 'authenticateUser',
        createAuth: 'createAuth'
    }
}