import { NullCheck } from "./nullcheck";
import { mysensor_sensor } from "./mysensors-types";
import { open } from 'sqlite';

export interface NodeData {
    id: number;
    sketchName: string;
    sketchVersion: string;
    lastHeard: Date;
    parentId: number;
    used: 0|1;
    sensors: SensorData[]
    lastRestart: Date;
}

export interface SensorData {
    id: number;
    nodeId: number;
    sType: mysensor_sensor;
}

export class Database {
    private dbPromise: any;

    /**
     * 
     * @param file Filename / path for the sqlite database
     */
    constructor(private file: string) {
        if (NullCheck.isUndefinedNullOrEmpty(this.file)) {
            throw('No dbname set');
        }
        this.dbPromise = open(this.file);
        this.checkDb();
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
            for(let x = 0; x<= 255; x++) {
                db.run(`insert into node (id, used) values (${x}, 0)`);
            }
        }
    }

    public async nodeHeard(nodeId: number): Promise<void> {
        const db = await this.dbPromise;
        await db.run(`update node set lastHeard=CURRENT_TIMESTAMP, used=1 where id=${nodeId}`);
    }

    public async sketchName(nodeId: number, name: string): Promise<void> {
        const db = await this.dbPromise;
        await db.run(`update node set sketchName="${name}" where id=${nodeId}`);
    }

    public async sketchVersion(nodeId: number, version: string): Promise<void> {
        const db = await this.dbPromise;
        await db.run( `update node set sketchVersion="${version}", lastRestart=CURRENT_TIMESTAMP where id=${nodeId}`);
    }

    public async getNodeList(): Promise<NodeData[]> {
        const db = await this.dbPromise;
        const result = (await db.all('select * from node where used=1')) as NodeData[];
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
}
