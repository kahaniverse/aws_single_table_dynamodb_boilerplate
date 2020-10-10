'use strict'

/**
 * This class holds all DynamoDB logic
 * Subclasses hold the PK, SK logic
 * https://github.com/awslabs/dynamodb-data-mapper-js can also be used instead. It requires Annotations etc.
 */
import EntityController from '../EntityController';
import Entity from '../Entity';
import User from '../Auth';
import {format} from '../FormatFunction';

import config from '../../../config.js';
import { has } from 'lodash';
import { PromiseResult } from 'aws-sdk/lib/request';
import AWS from 'aws-sdk'

const aws = require('../AWS');

const dynamo = new aws.DynamoDB.DocumentClient();

abstract class Dynamo<E extends Entity> extends EntityController<E>{
    //This is used for DB Entity in DynamoDb
    constructor(hash:format, range:format, needs_inverted_index: boolean) {
        super();
        this.hash = hash;
        this.range = range;
        this.needs_inverted_index = needs_inverted_index;
        this.tablename = process.env.IS_OFFLINE ? 'testDB' : config.aws_dynamob_tablename;
    }

    readonly allowDelete:boolean = false;
    readonly hash: format;
    readonly range: format;
    readonly needs_inverted_index?: boolean;
    readonly arg_fields?: string[]; //for nested classes only
    readonly tablename:string;

    indexes: [string, string?][] = [];

    addSecondaryIndex(key:string, range?:string) {
        //add secondary indexes
        this.indexes.push([key, range]);
    }

    async create(currentUser:User, newItem:E): Promise<E>{
        await this.validateUniqueness(currentUser, newItem);
        let created:E = newItem; //add uuid, timestamp etc. in the Operation class using 
        let params = {
            TableName: this.tablename,
            Item: this.addPKSK(newItem)
        }
  
        await dynamo.put(params).promise(); //we canprobably add some trigger for push notifications in AWS for the notification flow that should be handled separately
        return created;
    }

    private async read(currentUser:User, pk:string, sk:string): Promise<any>{
        //Use this only when all components of composite keys are known
        let params = {
            TableName: this.tablename,
            Key: {
                PK: pk,
                SK: sk
            }
        };

        return (await dynamo.get(params).promise()).Item;
    }

    async readById(currentUser:User, pk:string, sk:string): Promise<E>{
        return this.removePKSK(await this.read(currentUser, pk, sk));
    }

    async updateById(currentUser:User, updateItem:E, pk:string, sk:string): Promise<E>{        
        // using put for update also. update of dynamodb is for complex cases with conditionality
        let existing = this.read(currentUser, pk, sk);
        //add the id
        let toUpdate:any = existing;

        // Ensure at least one mutation is requested
        let mutations = [];
        for (const key in existing) {
            if (!has(existing, key) || existing[key] != updateItem[key]) {
                mutations.push(key); //we can store this if we want to track history
                toUpdate[key] = updateItem[key];
            }
        }

        let result:any = existing;

        if(mutations.length > 0) {
            if( currentUser) toUpdate.modifiedBy = currentUser.username;
            toUpdate.modifiedOn = new Date();

            let params = {
                TableName: this.tablename,
                Item: toUpdate
            }
            result = (await dynamo.put(params).promise()).Attributes;
        }
        return this.removePKSK(result);
    }

    async scanAndAction(method: { (arg: any, pk: string, sk: string): Promise<E>}, arg: any, condition:string = 'begins_with(PK, :pk) AND begins_with(SK, :sk)', attributes: any = {
        ':pk': this.hash(''),
        ':sk': this.range('')
    }, index?:string, limit?:number, marker?:any): Promise<Array<E>> {     
        let actionedItems:Array<E> = []; //this may cause memory overflow
        let ExclusiveStartKey: any = marker;
        let result: PromiseResult<AWS.DynamoDB.DocumentClient.ScanOutput, AWS.AWSError>;
        let params:any = { 
            TableName: this.tablename, 
            ExclusiveStartKey, 
            FilterExpression: `attribute_not_exists(deletedOn) AND ${condition}`,
            ExpressionAttributeValues: attributes
        };
        if(index) params.IndexName = index;
        let counter:number = 0;
        do {
            if(limit) params.Limit = limit - counter;
            result = await dynamo.scan(params).promise();
            ExclusiveStartKey = result.LastEvaluatedKey;
            if (result.Items.length > 0) {
                actionedItems = await Promise.all(result.Items.map(async (item) => method ? method(arg, item.PK, item.SK) : this.removePKSK(item)));
            };
            counter+= result.Items.length;
        } while((result.Items.length || result.LastEvaluatedKey) && (limit && counter<limit));
        return actionedItems;      
    }

    async updateAll(currentUser:User, updateFields:any, limit?:number, marker?:any, conditions?:string, attributes?:any): Promise<Array<E>>{
        updateFields.modifiedBy = currentUser.username;
        updateFields.modifiedOn = new Date();
        return this.scanAndAction(this.updateFieldsById, updateFields, conditions, attributes, null, limit, marker);      
    }

    async updateFieldsById(fields: any, pk:string, sk:string): Promise<E> {
        let expr = "SET ";
        let val = {};
        for (const key in fields) {
            val[':'+key] = fields[key];
            expr += key+'= :'+key+', ';            
        }
        let params = {
            TableName: this.tablename,
            Key: {
                PK: pk,
                SK: sk
            },
            UpdateExpression: expr.substring(0, expr.length - 2),
            ExpressionAttributeValues: val,
            ReturnValues:"ALL_NEW"        
        }
        let result = (await dynamo.update(params).promise()).Attributes;
        return this.removePKSK(result);
    }

    async deleteById(currentUser:User, pk:string, sk:string): Promise<E>{
        if(this.allowDelete) {
            let params = {
                TableName: this.tablename,
                Key: {
                    PK: pk,
                    SK: sk
                }
            };
    
            // post-process dynamo result before returning
            let result = (await dynamo.delete(params).promise()).Attributes;
    
            return this.removePKSK(result);
        }
        let fields = {
            deleteBy: currentUser.username,
            deleteOn: new Date()
        }
        return this.updateFieldsById(fields, pk, sk);
    }

    async deleteAll(currentUser:User, limit?:number, marker?:any, conditions?:string, attributes?:any): Promise<Array<E>>{
        return this.scanAndAction(this.deleteById, currentUser, conditions, attributes, null, limit, marker);     
    }

    static async purgeTable(tableName:string): Promise<any>{        
        if (!tableName.includes('dev') && !tableName.includes('test')) {
            console.log(`WARNING: Table name [${tableName}] ` +
            `contains neither dev nor test, not purging`);
            return;
        }
        let ExclusiveStartKey: any, result: PromiseResult<AWS.DynamoDB.DocumentClient.ScanOutput, AWS.AWSError>;
        do {
            result = await dynamo.scan({ TableName: tableName, ExclusiveStartKey }).promise();
            ExclusiveStartKey = result.LastEvaluatedKey;
            if (result.Items.length > 0) {
                await Promise.all(result.Items.map(async (item) => dynamo.delete({
                    TableName: tableName,
                    Key: {
                        PK: item.PK,
                        SK: item.SK
                    },
                }).promise()));
            };
        } while(result.Items.length || result.LastEvaluatedKey);
    }

    async query(params:any, limit?:number, marker?:any, conditions?:string, attributes?:any, sort?:string, projection?:string, listDeleted?:boolean): Promise<Array<E>>{
        params.ExclusiveStartKey = marker;    
        if(projection) {
            params.ProjectionExpression = this.convertToProjectionExpression(projection);
        }
        if(listDeleted) {
            params.FilterExpression = 'attribute_not_exists(deletedOn)';
            if(conditions) params.FilterExpression += ' AND ';
        }
        if(conditions) {
            params.FilterExpression += conditions;
            params.ExpressionAttributeValues = attributes;
        }

        let counter:number = 0;
        let actionedItems:Array<E> = []; //this may cause memory overflow
        let result: PromiseResult<AWS.DynamoDB.DocumentClient.QueryOutput, AWS.AWSError>;
        do {
            if(limit) params.Limit = limit - counter;
            result = (await dynamo.query(params).promise());
            params.ExclusiveStartKey = result.LastEvaluatedKey;
            if (result.Items.length > 0) {
                actionedItems = await Promise.all(result.Items.map(async (item) => this.removePKSK(item)));
            };
            counter+= result.Items.length;
        } while((result.Items.length || result.LastEvaluatedKey) && (limit && counter<limit));
        return actionedItems;
    }

    async listAll(currentUser:User, limit?:number, marker?:any, conditions?:string, attributes?:any, sort?:string, projection?:string, listDeleted?:boolean): Promise<Array<E>>{
        //for this to work must have items that are having hash with empty variable names
        //uses query in case no arg in hash
        let partition = this.hash('');
        if( partition == this.hash('abc')) {
            let params:any = {
                TableName: this.tablename,
                KeyConditionExpression: `PK = :pk`,
                ExpressionAttributeValues: {':pk': partition},
                ScanIndexForward: this.checkIfForwardScan(sort)
            };
            if(conditions) {
                params.ExpressionAttributeValues[':pk'] = partition;
            }

            return await this.query(params, limit, marker, conditions, attributes, sort, projection, listDeleted);
        }
        //else uses scan (not advisable)
        return this.scanAndAction(null, currentUser, conditions, attributes, null, limit, marker);     
    }

    async getByPK(condition:string, attributes: any, latestFirst:boolean = true, limit?:number, marker?:any): Promise<any>{ //any as can  one complex object also
        let params = {
            TableName: this.tablename,
            KeyConditionExpression: `PK = :pk AND ${condition}`,
            ExpressionAttributeValues: attributes,
            ScanIndexForward: latestFirst
        };

        let result = await this.query(params, limit, marker);
        // post-process dynamo result before returning
        return this.convertMultiple(result);
    }

    async getBySK(condition:string, attributes: any, latestFirst:boolean = true, limit?:number, marker?:any): Promise<any>{
        let params = {
            TableName: this.tablename,
            IndexName:'InvertedIndex',
            KeyConditionExpression: `SK = :sk AND ${condition}`,
            ExpressionAttributeValues: attributes,
            ScanIndexForward: latestFirst
        };

        let result = await this.query(params, limit, marker);
        // post-process dynamo result before returning
        return this.convertMultiple(result);
    }

    async getAllByKey(key:string, condition:string, attributes: any, limit?:number, marker?:any): Promise<Array<any>>{
        //uses scan (not advisable) on a sparse index and returns list of the key values
        return this.scanAndAction(null, null, condition, attributes, key+"Index", limit, marker);
    }

    async getByUniqueKeyValue(key:string, value:any): Promise<E>{
        //uses query on a unique sparse index
        let params = {
            TableName: this.tablename,
            IndexName: key+"Index",
            KeyConditionExpression:"#map = :map",
            ExpressionAttributeNames:{
                "#map": key
            },
            ExpressionAttributeValues: {
                ":map": value,
            },
            ScanIndexForward: true
        };

        let result = (await dynamo.query(params).promise()).Items;
        // post-process dynamo result before returning
        return this.removePKSK(result[0]);
    }

    async getByKeyValue(key:string, condition:string, attributes: any, latestFirst:boolean = true, limit?:number, marker?:any): Promise<Array<E>>{
        //uses query on a sparse index with a range attribute
        //uses query on a unique sparse index
        let params = {
            TableName: this.tablename,
            IndexName: key+"Index",
            KeyConditionExpression: condition,
            ExpressionAttributeValues: attributes,
            ScanIndexForward: latestFirst
        };

        let result = await this.query(params, limit, marker);
        // post-process dynamo result before returning
        return this.convertMultiple(result);
    }

    checkIfForwardScan(commaSeparatedString:string):boolean {
        return true; //override incase the sorting depends on fields given. Default is latest first
    }

    convertToProjectionExpression(commaSeparatedString:string):string {
        return "PK, SK, " + commaSeparatedString; //override incase the projection string needs to be different
    }

    convertMultiple(data:Array<any>):any //can be used when querying multiple rows from DB to join into one, hence not necessarily returning array
    {
        return data as unknown as E[];
    }

    abstract addPKSK(data:E):any; //used when entering into DB
    abstract removePKSK(data:any):E; //used when querying single item from DB
}

export = Dynamo;