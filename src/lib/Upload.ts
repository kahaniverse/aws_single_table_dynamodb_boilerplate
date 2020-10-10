
import ExcelToJSON from './ExcelToJSON';
import EntityController from './EntityController';
import Entity from './Entity';
import fs from 'fs';

class Upload<E extends Entity> {
    controller: EntityController<E>;

    constructor(controller:EntityController<E>) {
        this.controller = controller;
    }
    
    //add a bulk upload option
    uploadJSONFile(json_file_path:string): void {
        this.uploadJSON(JSON.parse(fs.readFileSync(json_file_path, 'utf8')));
    }

    uploadExcelFile(excel_file_path:string, sheetname?:string): void {
        this.uploadJSON(ExcelToJSON.parse(excel_file_path, sheetname)[sheetname]);
    }

    uploadJSON(data:any): void {
        if(data) for (const line of data) {
            try{
                this.controller.create(null, this.controller.convertOne(line));
            } catch(e) {
                console.log('ignore the error');
                
            }
        }
    }

} 

export = Upload;