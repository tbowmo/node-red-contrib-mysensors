import * as path from 'path';
import { open } from 'sqlite';

import { IDatabase, INodeData, ISensorData } from './database.interface';
import { NullCheck } from './nullcheck';

export class DatabaseSqlite implements IDatabase {
    private dbPromise: any;

    /**
     *
     * @param file Filename / path for the sqlite database
     */
    constructor(private file: string) {
        if (NullCheck.isUndefinedNullOrEmpty(this.file)) {
          //  throw new Error('No dbname set');
        } else {
            this.dbPromise = Promise.resolve()
                .then(() => open(this.file))
                .then((db) => db.migrate({migrationsPath: path.dirname(__dirname) + '/migrations'}));
            this.checkDb();
        }
    }

    public async nodeHeard(nodeId: number): Promise<void> {
        const db = await this.dbPromise;
        await db.run(`update node set lastHeard=CURRENT_TIMESTAMP, used=1 where nodeId=${nodeId}`);
    }

    public async sketchName(nodeId: number, name: string): Promise<void> {
        const db = await this.dbPromise;
        await db.run(`update node set sketchName='${name}' where nodeId=${nodeId}`);
    }

    public async sketchVersion(nodeId: number, version: string): Promise<void> {
        const db = await this.dbPromise;
        await db.run( `update node set sketchVersion='${version}', lastRestart=CURRENT_TIMESTAMP where nodeId=${nodeId}`);
    }

    public async getNodeList(): Promise<INodeData[]> {
        const db = await this.dbPromise;
        const result = (await db.all('select * from node where used=1')) as INodeData[];
        return result;
    }

    public async getFreeNodeId(): Promise<number> {
        const db = await this.dbPromise;
        const res = await db.get('select min(nodeId) id from node where used=0');
        return res.id;
    }

    public async close(): Promise<void> {
        const db = await this.dbPromise;
        await db.close();
    }

    public async setParent(node: string, last: string): Promise<void> {
        const db = await this.dbPromise;
        await db.run(`update node set parentId=${last} where nodeId=${node}`);
    }

    public async child(nodeId: number, childId: number, type: number, description: string): Promise<void> {
        const db = await this.dbPromise;
        db.run(`insert or replace into child (childId, nodeId, sType, description) values(${childId}, ${nodeId}, ${type}, '${description}')`);
    }

    public async childHeard(nodeId: number, childId: number): Promise<void> {
        const db = await this.dbPromise;
        await db.run(`update child set lastHeard=CURRENT_TIMESTAMP where childId=${childId} and nodeId=${nodeId}`);
    }

    public async getChild(nodeId: number, childId: number): Promise<ISensorData> {
        const db = await this.dbPromise;
        const result = (await db.get(`select * from child where nodeId=${nodeId} and childId=${childId}`)) as ISensorData;
        return result;
    }

    private async checkDb(): Promise<void> {
        const db = await this.dbPromise;

        const x = await db.get('select count(nodeId) cnt from node');
        if (x.cnt === 0) {
            for (let i = 1; i <= 254; i++) {
                db.run(`insert into node (nodeId, used) values (${i}, 0)`);
            }
        }
    }
}
