//The APIs in the paths folder get stitched here
import ApiBuilder from 'claudia-api-builder';
const api:ApiBuilder = new ApiBuilder();
// import createTable from './lib/CreateTable';
import UserController from './controllers/UserController';
import FollowUserController from './controllers/FollowUserController';
import Dynamo from './lib/dbs/Dynamo';

let controllers:Array<Dynamo<any>> = [];

function initialize() {
    controllers.push(new UserController(api));
    controllers.push(new FollowUserController(api));

    //this could possible be handled in Cluadiajs APIPostDeploy Steps. TODO
    // const AWS = require('./lib/AWS');
    // createTable(AWS, controllers, ()=>null); //no need here as for testing we can call separately. For seeding use a separate process
}

initialize();

export = {api, controllers};