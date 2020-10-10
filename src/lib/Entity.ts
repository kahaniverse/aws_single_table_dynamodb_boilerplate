import Schema from './Schema'

abstract class Entity extends Schema {
    //This is a proxy for the database stored entities. This is not specific to any DB. DB controller can choose to remove a field before storing
    id?:string; //autogenerated value where no unique primary key or a composite primary key
    createdOn: Date = new Date();
    createdBy?: string;
    modifiedOn?: Date;
    modifiedBy?: string;
    deletedOn?: Date;
    deletedBy?: string;
    comments?:number;
    views?:number;
    likes?:number;
    followers?:number;
    price?:number; //per unit
    unit?:string; // USD/month/1000views etc.

}

export = Entity;