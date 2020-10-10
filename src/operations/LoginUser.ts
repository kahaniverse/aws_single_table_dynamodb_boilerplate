import RestController from '../lib/RestController';
import Profile from '../components/schemas/Profile';
import AuthenticatedUser from '../components/schemas/AuthenticatedUser';
import ApiBuilder from 'claudia-api-builder';
import UserController from '../controllers/UserController';
import Operation from '../lib/Operation';

class LoginUser extends RestController<AuthenticatedUser, Profile> {

    constructor(builder:ApiBuilder, controller:UserController) {
        super("/api/users/login", Operation.Create, builder);
        this.dbController = controller;
        this.addOperation(Operation.Delete, builder);
    }

    async create(currentUser:AuthenticatedUser, loggedUser:AuthenticatedUser): Promise<Profile>{      
        if(currentUser) throw new Error('Already LogedIn');  
        //check pwd etc
        //TODO use passport
        //create the user
        // await this.controller.readById(currentUser);//TODO
        // await this.controller.updateById(currentUser);//TODO
        return loggedUser;
    }

    //log out
    async deleteById(currentUser:AuthenticatedUser): Promise<Profile>{
        if(!this.authorize(currentUser, 'User')) throw new Error('Unauthorized Access');  
        // await this.controller.updateById(currentUser);//TODO
        return currentUser;
    }

    readonly dbController:UserController;
}

export = LoginUser;