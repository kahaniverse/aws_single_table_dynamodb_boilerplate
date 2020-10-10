
import Entity from '../lib/Entity';
import { timestamp } from 'aws-sdk/clients/cloudfront';

class FollowUser extends Entity {
    readonly createdOn: Date;
    readonly following:string;
    readonly follower:string;
}
export = FollowUser;