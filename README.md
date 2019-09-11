## Set up

### User Service
1. cd into user-service
2. Run `npm install`

## Auth Service
1. cd into auth-service
2. run `npm install`

## Run the pact broker server
1. From the root directory ('pact-services'), run `npm run pact-broker`
2. This is then accessible from `http://localhost:8080`

## Run Services
1. From the root directory ('pact-services'), run `npm run start-services`
2. user-service runs on `http://localhost:3001` 
3. auth-service runs on `http://localhost:3002`

## Run Contract Tests
1. Run `npm run test` from either user-service or auth-service directories