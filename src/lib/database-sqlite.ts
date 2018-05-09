import { open } from 'sqlite';
import { IDatabase, INodeData } from './database.interface';
import { NullCheck } from './nullcheck';

export class Database implements IDatabase {
    private dbPromise: any;

    /**
     *
     * @param file Filename / path for the sqlite database
     */
    constructor(private file: string) {
        if (NullCheck.isUndefinedNullOrEmpty(this.file)) {
            throw new Error('No dbname set');
        }
        this.dbPromise = open(this.file);
        this.checkDb();
    }

    public async nodeHeard(nodeId: number): Promise<void> {
        const db = await this.dbPromise;
        await db.run(`update node set lastHeard=CURRENT_TIMESTAMP, used=1 where id=${nodeId}`);
    }

    public async sketchName(nodeId: number, name: string): Promise<void> {
        const db = await this.dbPromise;
        await db.run(`update node set sketchName='${name}' where id=${nodeId}`);
    }

    public async sketchVersion(nodeId: number, version: string): Promise<void> {
        const db = await this.dbPromise;
        await db.run( `update node set sketchVersion='${version}', lastRestart=CURRENT_TIMESTAMP where id=${nodeId}`);
    }

    public async getNodeList(): Promise<INodeData[]> {
        const db = await this.dbPromise;
        const result = (await db.all('select * from node where used=1')) as INodeData[];
        return result;
    }

    public async getFreeNodeId(): Promise<number> {
        const db = await this.dbPromise;
        const res = await db.get('select min(id) id from node where used=0');
        return res.id;
    }

    public async close(): Promise<void> {
        const db = await this.dbPromise;
        await db.close();
    }

    public async setParent(node: string, last: string): Promise<void> {
        const db = await this.dbPromise;
        await db.run(`update node set parentId=${last} where id=${node}`);
    }

    private async checkDb(): Promise<void> {
        const db = await this.dbPromise;
        await db.run(`CREATE TABLE IF NOT EXISTS node (
            id integer PRIMARY KEY AUTOINCREMENT,
            sketchName varchar,
            sketchVersion varchar,
            lastHeard timestamp,
            parentId integer,
            lastRestart timestamp,
            used boolean
        );`);

        await db.run(`CREATE TABLE IF NOT EXISTS child (
            id integer,
            nodeId integer,
            sType integer,
            lastHeard timestamp
        );`);
        const x = await db.get('select count(id) cnt from node');
        if (x.cnt === 0) {
            for (let i = 0; i <= 255; i++) {
                db.run(`insert into node (id, used) values (${i}, 0)`);
            }
        }
    }
}
