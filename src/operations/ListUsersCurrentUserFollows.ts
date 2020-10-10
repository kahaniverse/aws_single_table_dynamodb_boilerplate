import RestController from '../lib/RestController';
import FollowUser from '../entities/FollowUser';
import AuthenticatedUser from '../components/schemas/AuthenticatedUser';
import ApiBuilder from 'claudia-api-builder';
import FollowUserController from '../controllers/FollowUserController';
import Operation from '../lib/Operation';

class ListUsersCurrentUserFollows extends RestController<any, string> {

    constructor(builder:ApiBuilder, controller:FollowUserController) {
        super("/api/users/followees", Operation.List, builder);
        this.dbController = controller;
    }

    async listAll(currentUser:AuthenticatedUser, limit?:number, marker?:any): Promise<Array<string>>{       
        //TODO: check authorization of the currentUser for this action 
        if(!this.authorize(currentUser, 'User')) throw new Error('Unauthorized Access');
        let result:Array<FollowUser> = await this.dbController.getBySK("begins_with ( PK , :pk )", {
            ':sk': this.dbController.range(currentUser.username),
            ':pk': 'USER#'
        }, true, limit, marker);
        let list:Array<string>;
        for (const iterator of result) {
            list.push(iterator.follower);
        }
        return list;
    }

    readonly dbController:FollowUserController;
}

export = ListUsersCurrentUserFollows;