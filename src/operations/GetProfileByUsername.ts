import RestController from '../lib/RestController';
import Profile from '../components/schemas/Profile';
import AuthenticatedUser from '../components/schemas/AuthenticatedUser';
import ApiBuilder from 'claudia-api-builder';
import UserController from '../controllers/UserController';
import Operation from '../lib/Operation';
import User from '../entities/User';

class GetProfileByUsername extends RestController<any, Profile> {

    constructor(builder:ApiBuilder, controller:UserController) {
        super("/api/profiles/{username}", Operation.Read, builder);
        this.dbController = controller;
    }

    async readById(currentUser:AuthenticatedUser, username:string): Promise<Profile>{       
        //TODO: check authorization of the currentUser for this action 
        if(!this.authorize(currentUser, 'User')) throw new Error('Unauthorized Access');
        let user:User = await this.dbController.readById(currentUser, this.dbController.hash(username), this.dbController.range(username));        
        return new Profile(user);
    }

    readonly dbController:UserController;
}

export = GetProfileByUsername;