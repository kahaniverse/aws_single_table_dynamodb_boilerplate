import Entity from '../lib/Entity'
// import * as uuid from 'uuid'

class User extends Entity {
    constructor (name:string) {
        super();
        this.username = name;
    }
    //properties
    username:string; //this may get removed while storing
    readonly email:string;
    bio:string;
    image:string;//path to s3
    followers?:number;
    readonly createdOn: Date;
    readonly createdBy: string;
    readonly modifiedOn: Date;
    readonly modifiedBy: string;
    readonly id?: string;
    displayName: string;
}
export = User;