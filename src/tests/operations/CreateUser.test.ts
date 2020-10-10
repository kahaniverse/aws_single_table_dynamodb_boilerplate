const config = require('../../../config.js');
const {api:claudia, controllers} = require('../../initialize');

const createSpyObj = (baseName: string, methodNames: string | any[]): { [key: string]: any } => {
  let obj: any = {};

  for (let i = 0; i < methodNames.length; i++) {
      obj[methodNames[i]] = jest.fn();
  }

  return obj;
};

describe("create user", () => {  
  var lambdaContext: { [x: string]: any; done?: any; };

	const responseHeaders = function (headerName: string | number) {
    const headers = lambdaContext.done.mock.calls[0][1].headers;
    if (headerName) {
      return headers[headerName];
    } else {
      return headers;
    }
  },
  
  responseStatusCode = function () {    
    return lambdaContext.done.mock.calls[0][1].statusCode;
  },
  responseBody = function () {
    return lambdaContext.done.mock.calls[0][1].body;
  };

  beforeEach(() => {
    lambdaContext = createSpyObj('lambdaContext', ['done']);
  });

  function sendExpect(body: { username: string; email: string; }, status: number, response: string, done: jest.DoneCallback) {
    try {
      claudia.proxyRouter({
        requestContext: {
          resourcePath: '/api/users',
          httpMethod: 'POST',
        },
        body: body
      }, lambdaContext).then(() => {   
          expect(responseStatusCode()).toEqual(status);
          expect(responseBody()).toEqual(response);
          // expect(lambdaContext.done).toHaveBeenCalledWith(null, expect.objectContaining({"statusCode": 201}));
        }).then(done, done.fail);
    } catch (e) {
      expect(e).toBeFalsy();
      done();
    }
  }

  test("new user", (done) => {
    sendExpect({ "username": "test_dummy", "email": "aaa1@ddd.com"}, 201, '{"username":"test_dummy"}', done);
  }, 10000);

  test("duplicate user name", (done) => {
    sendExpect({ "username": "test_dummy", "email": "aaa2@ddd.com"}, 500, "<error>Username test_dummy already taken</error>", done);
  }, 10000);

  test("duplicate email", (done) => {
    sendExpect({ "username": "test_dummy2", "email": "aaa1@ddd.com"}, 500, "<error>User with given email aaa1@ddd.com already exists</error>", done);
  }, 10000);
});