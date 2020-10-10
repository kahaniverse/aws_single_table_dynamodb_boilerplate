import RestController from '../lib/RestController';
import FollowUser from '../entities/FollowUser';
import AuthenticatedUser from '../components/schemas/AuthenticatedUser';
import ApiBuilder from 'claudia-api-builder';
import FollowUserController from '../controllers/FollowUserController';
import Operation from '../lib/Operation';

class ListCurrentUserFollowers extends RestController<any, string> {

    constructor(builder:ApiBuilder, controller:FollowUserController) {
        super("/api/users/followers", Operation.List, builder);
        this.dbController = controller;
    }

    async listAll(currentUser:AuthenticatedUser, limit?:number, marker?:any): Promise<Array<string>>{       
        //TODO: check authorization of the currentUser for this action 
        if(!this.authorize(currentUser, 'User')) throw new Error('Unauthorized Access');
        let result:Array<FollowUser> = await this.dbController.getByPK("begins_with ( SK , :sk )", {
            ':pk': this.dbController.hash(currentUser.username),
            ':sk': 'FOLLOW#'
        }, true, limit, marker);
        let list:Array<string>;
        for (const iterator of result) {
            list.push(iterator.follower);
        }
        return list;
    }

    readonly dbController:FollowUserController;
}

export = ListCurrentUserFollowers;