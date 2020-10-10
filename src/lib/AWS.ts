
function configure(config) {
    console.log('******** TESTING ENV ******** ' + process.env.IS_OFFLINE);
    
    const AWS = require('aws-sdk');
    const local = {
        region: 'localhost',
        endpoint: "http://localhost:8000"
    };
    const server = {
        region: config.aws_region,
        accessKeyId: config.aws_accessKeyId,
        secretAccessKey: config.aws_secretAccessKey
    }
    
    AWS.config.update(process.env.IS_OFFLINE ? local : server);
    return AWS;
}

module.exports = configure(require('../../config.js'));