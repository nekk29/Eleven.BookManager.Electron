import { v4 as uuidv4 } from 'uuid';
import SQLiteEntity from '../../../repositories/sqlite/models/base/SQLiteEntity';

export default class SystemEntity extends SQLiteEntity {
    id: string = uuidv4();
    creationUser: string = 'admin';
    creationDate: Date = new Date();
    updateUser: string = 'admin';
    updateDate: Date = new Date();
    isActive: boolean = true;
}
