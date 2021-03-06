# serverless-food-app Server project

## How to run the app

If you want to just run the app you can start the client and connect already deployed 
lambda functions

cd client

npm install

npm run start


## How to run server locally

### Install serverless and offline

npm install -g serverless

serverless offline -s dev

### Install dynamodb local

npm install --save serverless-dynamodb-local

### Start server locally

serverless offline -s dev

### Start DB locally

sls dynamodb-local

### Client to connect local server

Add an environment variable called 
change config variable apiEndpoint
http://localhost:4000/dev
