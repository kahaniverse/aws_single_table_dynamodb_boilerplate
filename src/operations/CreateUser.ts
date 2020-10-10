import RestController from '../lib/RestController';
import Profile from '../components/schemas/Profile';
import AuthenticatedUser from '../components/schemas/AuthenticatedUser';
import NewUser from '../components/schemas/NewUser';
import DBUser from '../entities/User';
import ApiBuilder from 'claudia-api-builder';
import UserController from '../controllers/UserController';
import Operation from '../lib/Operation';

class CreateUser extends RestController<NewUser, Profile> {

    constructor(builder:ApiBuilder, controller:UserController) {
        super("/api/users", Operation.Create, builder);
        this.dbController = controller;
    }

    //signup
    async create(currentUser:AuthenticatedUser, newProfile:NewUser): Promise<Profile> {    
        if(!this.authorize(currentUser, 'User')) throw new Error('Unauthorized Access'); 
        let dbUser:DBUser = await this.dbController.create(currentUser, this.dbController.convertOne(newProfile));        
        return this.envelop(new Profile(dbUser));
    }
    readonly dbController:UserController;
}

export = CreateUser;