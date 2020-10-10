import RestController from '../lib/RestController';
import Profile from '../components/schemas/Profile';
import AuthenticatedUser from '../components/schemas/AuthenticatedUser';
import ApiBuilder from 'claudia-api-builder';
// import UserController from '../controllers/UserController';
import Operation from '../lib/Operation';

class GetCurrentUser extends RestController<any, Profile> {

    constructor(builder:ApiBuilder) {
        super("/api/users", Operation.Read, builder);
        // this.controller = controller;
    }

    async readById(currentUser:AuthenticatedUser): Promise<Profile>{    
        return currentUser;
    }

    // readonly controller:UserController;
}

export = GetCurrentUser;