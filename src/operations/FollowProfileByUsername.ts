import RestController from '../lib/RestController';
import AuthenticatedUser from '../components/schemas/AuthenticatedUser';
import FollowUser from '../entities/FollowUser';
import ApiBuilder from 'claudia-api-builder';
import FollowUserController from '../controllers/FollowUserController';
import Operation from '../lib/Operation';

class FollowProfileByUsername extends RestController<string, boolean> {

    constructor(builder:ApiBuilder, controller:FollowUserController) {
        super("/api/profiles/{username}/follow", Operation.Create, builder);
        this.dbController = controller;
        this.addOperation(Operation.Delete, builder);
    }

    async create(currentUser:AuthenticatedUser, followUsername:string): Promise<boolean>{      
        if(!this.authorize(currentUser, 'User')) throw new Error('Unauthorized Access');  
        await this.dbController.create(currentUser, {follower: currentUser.username, following: followUsername} as FollowUser);
        return true;
    }

    async deleteById(currentUser:AuthenticatedUser, followedUsername:string): Promise<boolean>{
        if(!this.authorize(currentUser, 'User')) throw new Error('Unauthorized Access');  
        await this.dbController.deleteById(currentUser, this.dbController.hash(currentUser.username), this.dbController.range(followedUsername));
        return true;
    }

    readonly dbController:FollowUserController;
}

export = FollowProfileByUsername;