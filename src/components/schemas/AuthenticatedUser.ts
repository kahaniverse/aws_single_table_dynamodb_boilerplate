import Auth from "../../lib/Auth";
import Profile from "./Profile";

interface AuthenticatedUser extends Profile, Auth {
    //This uses the Entity used in DB and not self
    bio:string;
    image:string;//path to s3
    readonly username: string;
    //can have role info
}
export = AuthenticatedUser;