import Api from './Api';
import Entity from './Entity'
import User from './Auth';

abstract class EntityController<E extends Entity> implements Api<E, E> {

    abstract create(currentUser:User, newItem:E): Promise<E>;

    abstract readById(currentUser:User, ...id:Array<string|number>): Promise<E>;

    abstract updateById(currentUser:User, updateItem:E, ...id:Array<string|number>): Promise<E>;

    abstract updateAll(currentUser:User, updateFields:any, limit?:number, marker?:any, conditions?:string, attributes?:any): Promise<Array<E>>;

    abstract deleteById(currentUser:User, ...id:Array<string|number>): Promise<E>;

    abstract deleteAll(currentUser:User, limit?:number, marker?:any, conditions?:string, attributes?:any): Promise<Array<E>>;

    abstract listAll(currentUser:User, limit?:number, marker?:any, conditions?:string, attributes?:any): Promise<Array<E>>;
    
    abstract convertOne(data:any): E; //used for querying excel

    abstract validateUniqueness(currentUser:User, data:E):void; //throws Exceptions
}

export = EntityController;