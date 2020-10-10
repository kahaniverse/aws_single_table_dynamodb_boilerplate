import Schema from "../../lib/Schema";

class NewUser extends Schema {
    constructor(username:string, email:string, pwd:string) {
        super();
        this.username = username; 
        this.email = email; 
        this.pwd = pwd; 
    }

    //properties
    readonly username: string;
    email:string;
    pwd:string;
}

export = NewUser;