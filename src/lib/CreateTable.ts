import { doesNotMatch } from 'assert';
import config from '../../config.js';
import Dynamo from './dbs/Dynamo';

function createTable(AWS:any, controllers:Array<Dynamo<any>>, done) {
    
    //create table and indexes if not already present
    let dynamodb = new AWS.DynamoDB();

    let attributes = [
        {
            AttributeName: "PK",
            AttributeType: "S"
        },
        {
            AttributeName: "SK",
            AttributeType: "S"
        }
    ];
    let params = {
        AttributeDefinitions: attributes,
        KeySchema: [
        {
            AttributeName: "PK",
            KeyType: "HASH"
        },
        {
            AttributeName: "SK",
            KeyType: "RANGE"
        }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        },
        TableName: process.env.IS_OFFLINE ? 'testDB' : config.aws_dynamob_tablename
    };
    
    // Create the table.
    dynamodb.createTable(params, function(err, data) {
        if(err) console.log("Table probably already exists: ", err);
    
        let params2 = {
            TableName: process.env.IS_OFFLINE ? 'testDB' : config.aws_dynamob_tablename
        };
        console.log("Checking Table");
    
        dynamodb.waitFor('tableExists', params2, async function(err, data) {
            if (err) {
                console.log(err.stack); // an error occurred
            }
                        
            //Secondary sparse indexes
            if(controllers) for (const controller of controllers) {
                if(controller) {
                    if(controller.needs_inverted_index) await createSecondaryIndex(dynamodb, attributes, "InvertedIndex", "SK", "PK");
                    for (const iterator of controller.indexes) {
                        let attributes2 = [
                            {
                                AttributeName: iterator[0],
                                AttributeType: "S"
                            }
                        ];
                        if(iterator[1]) {
                            attributes2.push({
                                AttributeName: iterator[1],
                                AttributeType: "S"
                            });
                        };
                        await createSecondaryIndex(dynamodb, attributes2, iterator[0]+"Index", iterator[0], iterator[1]);
                    }
                }        
            } 
            done();
        });
        
    });
}

async function createSecondaryIndex(dynamodb:any , attributes: any, name:string, hash:string, range:string) {

    let updateTablePromise = function(params) {
        return new Promise((resolve, reject) => {
            setTimeout( () => dynamodb.updateTable(params, (err, script) => {
                if (err) reject(err)
                else resolve(script);
            }), 5000);
        });
    };

    let keyschema = [
        {
            "AttributeName": hash,
            "KeyType": "HASH"
        }
    ];
    if(range) {
        keyschema.push(
            {
                "AttributeName": range,
                "KeyType": "RANGE"
            }
        )
    }
    let secIndex = {
        TableName: process.env.IS_OFFLINE ? 'testDB' : config.aws_dynamob_tablename,
        AttributeDefinitions: attributes,
        GlobalSecondaryIndexUpdates: [
            {
                "Create": {
                    "IndexName": name,
                    "KeySchema": keyschema,
                    "Projection": {
                        "ProjectionType": "ALL"
                    },
                    "ProvisionedThroughput": {
                        "ReadCapacityUnits": 1,
                        "WriteCapacityUnits": 1
                    }
                }
            }
        ]
    };

    try{
        await updateTablePromise(secIndex);
    } catch(e) {

    }
}

export = createTable;