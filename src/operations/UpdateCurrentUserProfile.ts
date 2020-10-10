import RestController from '../lib/RestController';
import Profile from '../components/schemas/Profile';
import AuthenticatedUser from '../components/schemas/AuthenticatedUser';
import ApiBuilder from 'claudia-api-builder';
import DBUser from '../entities/User';
import UserController from '../controllers/UserController';
import Operation from '../lib/Operation';

class UpdateCurrentUserProfile extends RestController<Profile, Profile> {

    constructor(builder:ApiBuilder, controller:UserController) {
        super("/api/users", Operation.Update, builder);
        this.dbController = controller;
    }

    async updateById(currentUser:AuthenticatedUser, updatedProfile:Profile): Promise<Profile>{  
        if(!this.authorize(currentUser, 'User')) throw new Error('Unauthorized Access'); 
        //update the fields that can be changed     
        return new Profile(await this.dbController.updateById(currentUser, updatedProfile as unknown as DBUser, this.dbController.hash(currentUser.username), this.dbController.range(currentUser.username)));
    }
    readonly dbController:UserController;
}

export = UpdateCurrentUserProfile;