//All Operations for User can be listed out here

import GetCurrentUser from '../operations/GetCurrentUser';
import GetProfileByUsername from '../operations/GetProfileByUsername';
import ApiBuilder from 'claudia-api-builder';
import Dynamo from "../lib/dbs/Dynamo";
import User from '../entities/User';
import CreateUser from '../operations/CreateUser';
import LoginUser from '../operations/LoginUser';
import UpdateCurrentUserProfile from '../operations/UpdateCurrentUserProfile';
import slugify from 'slugify';
import { clone } from 'lodash';

class UserController extends Dynamo<User>{
    constructor(builder?:ApiBuilder) {
        super((username) => `USER#${username}`, (username) => `#METADATA#${username}`, false);
        this.addSecondaryIndex('email');
        if(builder) {
            new CreateUser(builder, this);
            new LoginUser(builder, this);
            new GetCurrentUser(builder); //no need for db interaction
            new GetProfileByUsername(builder, this);
            new UpdateCurrentUserProfile(builder, this);
        }
    }

    addPKSK(data:User) {
        if(data == null) return null;    
        let result:any = clone(data);
        result.PK = this.hash(data.username);
        result.SK = this.range(data.username);
        delete result.username;
        return result;
    }
    
    removePKSK(data:any): User {    
        if(data == null) return null;    
        data.username = data.PK.substring(5);
        delete data.PK;
        delete data.SK;
        return data as User;
    }

    convertOne(data:any): User {
        if(data == null || data.username == null) return null;
        let result:User = data as User;
        let slug = slugify(result.username);
        if(slug != result.username) {
            result.displayName = result.username;
            result.username = slug;
        }
        return result;
    }

    convertMultiple(data:Array<any>): User {
        let user:User = data[0]as User;
        //add all other rows as joins
        return user;
    }

    async validateUniqueness(currentUser:User, data:User):Promise<void> {//assume username doesnot have blanks etc. as slugify was already used
        //check email
        if(await this.getByUniqueKeyValue('email', data.email)) throw new Error(`User with given email ${data.email} already exists`);
        //check username
        let check = await this.readById(currentUser, this.hash(data.username), this.range(data.username));
        if(check) throw new Error(`Username ${data.username} already taken`);        
    }
}

export = UserController;