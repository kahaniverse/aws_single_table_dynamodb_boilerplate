# aws_single_table_dynamodb_boilerplate
Boilerplate code for creating an API using AWS API Gateway, Single Table DynamoDB, with Claudia.js

## Features
- Uses Typescript. Provides type definitions for Claudiajs
- Uses JEST for Testing
- Uses DynamoDB local to test locally without deployment
- Lets you create the Table and Indexes programatically. Table has PK, SK pattern as advised by AWS docs
- Segregates code into Model (in entities), View Model (in components/schemas) and Controller (DB specific in controllers, REST related in operations)
- Clean code