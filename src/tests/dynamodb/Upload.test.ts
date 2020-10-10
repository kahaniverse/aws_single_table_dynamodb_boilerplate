import Upload from '../../lib/Upload'
import Controller from '../../controllers/UserController'

process.env.IS_OFFLINE= 'true';

describe("Excel upload", () => {
    test("upload users sheet", (done) => {
      try {
        const engine = new Upload(new Controller())
        engine.uploadExcelFile('src/tests/dynamodb/users.xlsx', 'Users');
        const AWS = require('../../lib/AWS');
        let dynamodb = new AWS.DynamoDB();
        dynamodb.listTables({}, function(err, data) {
            expect(JSON.stringify(data)).toBe('{"TableNames":["testDB"]}');
            done();
        });
      } catch (e) {
        console.log(e);
        
        expect(e).toBeFalsy();
        done();
      }
    });
});