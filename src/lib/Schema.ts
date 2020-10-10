class Schema {
    //This is all the API schema base class

    /**
     * use the data to provide links on the possible actions
     * _links: {
     *  action_name: 'GET/POST/...: relative url'
     * }
     */
    _links?:{(action:string):string};
}
export = Schema;