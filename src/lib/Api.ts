
import User from './Auth';

interface Api<REQUEST_TYPE, RESPONSE_TYPE> {

    create(currentUser:User, newItem:REQUEST_TYPE, ...within:Array<string|number>): Promise<RESPONSE_TYPE>;

    readById(currentUser:User, ...id:Array<string|number>): Promise<RESPONSE_TYPE>;

    updateById(currentUser:User, updateItem:REQUEST_TYPE, ...id:Array<string|number>): Promise<RESPONSE_TYPE>;

    updateAll(currentUser:User, updateFields:any, ...withinNcondition:Array<any>): Promise<Array<RESPONSE_TYPE>>;

    deleteById(currentUser:User, ...id:Array<string|number>): Promise<RESPONSE_TYPE>;

    deleteAll(currentUser:User, ...withinNcondition:Array<any>): Promise<Array<RESPONSE_TYPE>>;

    listAll(currentUser:User, ...withinNcondition:Array<any>): Promise<Array<RESPONSE_TYPE>>;
}

export = Api;