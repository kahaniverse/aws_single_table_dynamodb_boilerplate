import Api from './Api';
import Operation from './Operation';
import Auth from './Auth';
import ApiBuilder from 'claudia-api-builder';
import { values } from 'lodash';
import User from '../entities/User';

/**
 * All Claudia API Builder related code should be here
 * Errors should get caught with Claudia and 500 code should get sent. 
 * For all other codes use throw new ApiBuilder.ApiResponse('<error>NOT OK</error>', {'Content-Type': 'text/xml'}, CODE);
 */

abstract class RestController<REQUEST_TYPE, RESPONSE_TYPE> implements Api<REQUEST_TYPE, RESPONSE_TYPE>{

    constructor(path:string, operation:Operation, builder:ApiBuilder) {
        this.path = path;
        this.operation = operation;
        this.addOperation(operation, builder);
    }

    addOperation(operation:Operation, builder:ApiBuilder) {
        RestController[Operation[operation]](this.path, builder, this);
    }

    static Create(path:string, builder:ApiBuilder, controller: RestController<any, any> ): void {
        builder.post(path, async function (request) {
            try {
                //check authentication token and get the User. Authorize in the functions 
                let currentUser:Auth = controller.authenticateAndGetUser(request);
                return await controller.create(currentUser, request.body, ...controller.convertToIdParams(request.pathParams));
            } catch (e) {
                throw new ApiBuilder.ApiResponse(`<error>${e.message}</error>`, {'Content-Type': 'text/xml'}, 500);
            }
        }, { 
            success: 201,
            error: {code: 500} 
        })
    };

    static Read(path:string, builder:ApiBuilder, controller: RestController<any, any>): void {
        builder.get(path, async function (request) {
            //TODO: we can do validation here for path param match in the path
            //check authentication token and get the User. Authorize in the functions
            let currentUser:Auth = controller.authenticateAndGetUser(request);
            return await controller.readById(currentUser, ...controller.convertToIdParams(request.pathParams));
        })
    };

    static Update(path:string, builder:ApiBuilder, controller: RestController<any, any>): void {
        builder.put(path, async function (request) {
            //check authentication token and get the User. Authorize in the functions
            let currentUser:Auth = controller.authenticateAndGetUser(request);
            return await controller.updateById(currentUser, request.body, ...controller.convertToIdParams(request.pathParams));
        })
    };

    static Delete(path:string, builder:ApiBuilder, controller: RestController<any, any>): void {
        builder.delete(path, async function (request) {
            //TODO: we can do validation here for path param match in the path
            //check authentication token and get the User. Authorize in the functions
            let currentUser:Auth = controller.authenticateAndGetUser(request);
            return await controller.deleteById(currentUser, ...controller.convertToIdParams(request.pathParams));
        }, {success: { contentType: 'text/plain'}})
    };

    static getParams(request, controller: RestController<any, any>):Array<any> {
        if(request.queryString['_offset']) throw new Error("limit is not supporte. Use marker instead");
        let params:any[] = [
            request.queryString['_limit'], 
            request.queryString['_marker']
        ];
        let tuple = controller.convertToConditionTuple(request.queryString, request.pathParams);
        params.push(tuple[0]);
        params.push(tuple[1]);
        if(request.queryString['_sort']) {
            params.push(request.queryString['_sort']);
        }
        if(request.queryString['_fields']) {
            params.push(request.queryString['_fields']);
        }
        return params;          
    }

    static List(path:string, builder:ApiBuilder, controller: RestController<any, any>): void {
        builder.get(path, async function (request) {
            //TODO: we can do validation here for path param match in the path
            //check authentication token and get the User. Authorize in the functions
            let currentUser:Auth = controller.authenticateAndGetUser(request);
            return await controller.listAll(currentUser, ...RestController.getParams(request, controller));
        })
    };

    static UpdateAll(path:string, builder:ApiBuilder, controller: RestController<any, any>): void {
        builder.put(path, async function (request) {
            //check authentication token and get the User. Authorize in the functions
            let currentUser:Auth = controller.authenticateAndGetUser(request);
            return await controller.updateAll(currentUser, request.body, ...RestController.getParams(request, controller));
        })
    };

    static DeleteAll(path:string, builder:ApiBuilder, controller: RestController<any, any>): void {
        builder.delete(path, async function (request) {
            //TODO: we can do validation here for path param match in the path
            //check authentication token and get the User. Authorize in the functions
            let currentUser:Auth = controller.authenticateAndGetUser(request);
            return await controller.deleteAll(currentUser, ...RestController.getParams(request, controller));
        })
    };

    readonly path:string;
    readonly operation:Operation;

    /**
     * Envelop canse HATEOAS pattern: use the data to provide links on the possible actions
     * using the below format instead of https://restfulapi.net/hateoas/
     * _links: {
     *  action_name: 'GET/POST/...: relative url'
     * }
     */
    envelop(content:RESPONSE_TYPE):RESPONSE_TYPE {
        //must be overridden to add the _links field in  content schema
        return content;
    }

    authenticateAndGetUser(request: any):Auth {
        //This should ideally have all required details in token itself.
        //May need checking DB on timeouts
        //throw new ApiBuilder.ApiResponse('<error>NOT AUTHENTICATED</error>', {'Content-Type': 'text/xml'}, 401);
        // console.log(request);
        return process.env.IS_OFFLINE ? new User("test_dummy") : null;
    }

    authorize(currentUser:Auth, onSchema:string):boolean {
        //is this.operation onSchema allowed for currentUser
        return process.env.IS_OFFLINE == 'true'; //allows all for testing only
    }

    // below functions should be overridden
    async create(currentUser:Auth, newItem:REQUEST_TYPE, ...within:Array<string|number>): Promise<RESPONSE_TYPE> {
        throw new Error("Illegal Access");
        return null;
    }

    async readById(currentUser:Auth, ...id:Array<string|number>): Promise<RESPONSE_TYPE>{
        throw new Error("Illegal Access");
        return null;
    }

    async updateById(currentUser:Auth, updateItem:REQUEST_TYPE, ...id:Array<string|number>): Promise<RESPONSE_TYPE>{
        throw new Error("Illegal Access");
        return null;
    }

    async updateAll(currentUser:Auth, updateFields:any, ...withinNcondition:Array<any>): Promise<Array<RESPONSE_TYPE>>{
        throw new Error("Illegal Access");
        return null;
    }

    async deleteById(currentUser:Auth, ...id:Array<string|number>): Promise<RESPONSE_TYPE>{
        throw new Error("Illegal Access");
        return null;
    }

    async deleteAll(currentUser:Auth, ...withinNcondition:Array<any>): Promise<Array<RESPONSE_TYPE>>{
        throw new Error("Illegal Access");
        return null;
    }

    async listAll(currentUser:Auth, ...withinNcondition:Array<any>): Promise<Array<RESPONSE_TYPE>>{
        throw new Error("Illegal Access");
        return null;
    }

    convertToIdParams(pathParams:any):Array<string> {
        return values(pathParams); //this may not work if the path params are not as per the order in the path
    }

    convertToConditionTuple(queryParams:{[key:string]: string}, pathParams:{[key:string]: string} = {}):[condition:string, attributes:any] {
        //this is very basic query parsingd specific to equality conditions for dynamodb. Must be overridden in case of complex queries such as FIQL or RSQL
        let condition:string = '';
        let attributes = pathParams;
        for (const key in queryParams) {
            let val = queryParams[key];
            if(val.trim().match(/([<>][=]?|GT |LT |LE |GE )+.*/)) {
                condition += key + ' ' + val + ' AND ';
            } else {
                condition += key + ' = :' + key + ' AND ';
                attributes[':'+key] = val;
            }
        }
        return [condition.substring(0, condition.length - 5), attributes];
    }
}

export = RestController;
