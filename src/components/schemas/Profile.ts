import Schema from "../../lib/Schema";
import Auth from "../../lib/Auth";
import DBUser from '../../entities/User';

class Profile extends Schema implements Auth {

    constructor(dbUser:DBUser) {
        super();
        this.username = dbUser.displayName || dbUser.username;
        this.bio = dbUser.bio;
        this.image = dbUser.image; //this needs to be converted from string to pic if required
    }

    //This uses the Entity used in DB and not self
    bio:string;
    image:string;//path to s3
    readonly username: string;

    //computed
    follower:boolean;
    following:boolean;
    //can have role info
}
export = Profile;