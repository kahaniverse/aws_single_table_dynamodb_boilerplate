DynamoDbLocal = require('dynamodb-local');
const dynamoLocalPort = 8000;
const createTable = require('./src/lib/CreateTable')
// const config = require('./config.js');

module.exports = () => {
    return new Promise(done => {
        // ...
        // Set reference to mongod in order to close the server during teardown.  
        process.env.IS_OFFLINE = 'true';
        const {api, controllers} = require('./src/initialize');
        DynamoDbLocal.launch(dynamoLocalPort).then((data) => {
            global.__DYNAMODB__ = data;
            console.log('PID created: ', global.__DYNAMODB__.pid);
            createTable(require('./src/lib/AWS'), controllers, () => {
                console.log('Table created');
                done()
            });
        });
    });
}