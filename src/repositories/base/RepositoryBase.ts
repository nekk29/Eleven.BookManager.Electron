import path from 'node:path';
import SQLiteClient from '../sqlite/SQLiteClient';
import { Filter } from '../sqlite/models/params/Filter';
import SortParam from '../../models/entity/base/SortParam';
import PageResult from '../../models/entity/base/PageResult';
import SQLiteEntity from '../sqlite/models/base/SQLiteEntity';
import SystemEntity from '../../models/entity/base/SystemEntity';
import SettingsService from '../../services/SettingsService';
import { DatabaseSchema } from '../schema/DatabaseSchema';

export class Repository {
    static getDatabaseUri(): string {
        const librarySettings = SettingsService.getLibrarySettings();
        return path.join(librarySettings.workingDirectory, 'library.db');
    }

    static createOrUpdateDatabase() {
        try {
            const client = new SQLiteClient({
                connectionUri: this.getDatabaseUri(),
                schema: DatabaseSchema,
                tableName: null,
                verbose: false
            });

            client.createOrUpdateDatabase();

            console.log("Data Source has been initialized !");
        } catch (error) {
            console.error("Error during Data Source initialization", error);
        }
    }
}

export default class RepositoryBase<T extends SQLiteEntity & SystemEntity> {
    protected client: SQLiteClient;

    constructor(tableName: string) {
        this.client = new SQLiteClient({
            connectionUri: Repository.getDatabaseUri(),
            schema: DatabaseSchema,
            tableName,
            verbose: false
        });
    }

    add(model: Partial<T>): string | null {
        model.creationDate = new Date();
        model.updateDate = new Date();

        const result = this.client.insert(model);

        return result.length != 0 ? result[0].value : null;
    }

    update(model: Partial<T>): number {
        model.updateDate = new Date();
        return this.client.update(model);
    }

    delete(id: string): number {
        return this.client.delete({ id } as T);
    }

    deleteBy(filter: Partial<T>): number {
        return this.client.deleteBy(filter);
    }

    get(id: string): T | undefined {
        return this.client.findOne({ id } as Partial<T>);
    }

    getBy(filter: Partial<T>): T | undefined {
        return this.client.findOneBy(filter);
    }

    list(limit: number = 1000): T[] | undefined {
        return this.client.findAll<T>(limit);
    }

    listBy(filter: Partial<T>): T[] | undefined {
        return this.client.findManyBy(filter);
    }

    listByFilter(filter: Filter): T[] | undefined {
        return this.client.findManyByFilter(filter);
    }

    listPageBy(page: number, pageSize: number, filter: Partial<T>, sorts: SortParam[] = []): PageResult<T> {
        const result = this.client.findPageBy<T>(page, pageSize, filter, sorts);

        return {
            data: result.data as T[] ?? undefined,
            page: result.page,
            pageSize: result.pageSize,
            totalCount: result.totalCount,
        };
    }

    listPageByFilter(page: number, pageSize: number, filter: Filter, sorts: SortParam[] = []): PageResult<T> {
        const result = this.client.findPageByFilter<T>(page, pageSize, filter, sorts);

        return {
            data: result.data as T[] ?? undefined,
            page: result.page,
            pageSize: result.pageSize,
            totalCount: result.totalCount,
        };
    }

    countBy(filter: Partial<T>): number {
        return this.client.countBy(filter);
    }

    countByFilter(filter: Filter): number {
        return this.client.countByFilter(filter);
    }
}
