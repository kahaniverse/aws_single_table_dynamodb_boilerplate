'use strict';
const excelToJson = require('convert-excel-to-json');

module ExportToJSON {
    export function parse(filename:string, sheetname?:string) {
        let config:any = {
            sourceFile: filename,
            header:{
                rows: 1
            },
            columnToKey: {
                '*': '{{columnHeader}}'
            }
        };
        if(sheetname) config.sheets = [sheetname];

        return excelToJson(config);
    }
}
export = ExportToJSON;