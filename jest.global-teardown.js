DynamoDbLocal = require('dynamodb-local');

module.exports = async function () {
    DynamoDbLocal.stopChild(global.__DYNAMODB__)
};