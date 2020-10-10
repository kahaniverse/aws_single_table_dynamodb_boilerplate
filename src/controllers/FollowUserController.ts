//All Operations for User can be listed out here
import ApiBuilder from 'claudia-api-builder';
import Dynamo from "../lib/dbs/Dynamo";
import FollowUser from '../entities/FollowUser';
import FollowProfileByUsername from '../operations/FollowProfileByUsername';
import ListCurrentUserFollowers from '../operations/ListCurrentUserFollowers';
import ListUsersCurrentUserFollows from '../operations/ListUsersCurrentUserFollows';
import Auth from '../lib/Auth';

class FollowUserController extends Dynamo<FollowUser>{

    constructor(builder:ApiBuilder) {
        super((follower:string) => `USER#${follower}`, (following:string) => `FOLLOW#${following}`, true);
        new FollowProfileByUsername(builder, this);
        new ListCurrentUserFollowers(builder, this);
        new ListUsersCurrentUserFollows(builder, this);
    }

    addPKSK(data:FollowUser) {
        let result:any = data;
        result.PK = this.hash(data.follower);
        result.SK = this.range(data.following);
        delete result.follower;
        delete result.following;
        return result;
    }

    removePKSK(data: any): FollowUser {
        data.follower = data.PK.substring(5);
        data.following = data.SK.substring(7);
        delete data.PK;
        delete data.SK;
        return data as FollowUser;
    }

    convertOne(data:any): FollowUser {
        return data as FollowUser;
    }

    convertMultiple(dataSet:any[]): Array<FollowUser> {
        let result:Array<FollowUser> = [];
        //multiple items
        for (const data of dataSet) {
            result.push(data as FollowUser)
        }
        return result;
    }

    validateUniqueness(currentUser:Auth, data:FollowUser):void {
        //do nothing
    }
}

export = FollowUserController;