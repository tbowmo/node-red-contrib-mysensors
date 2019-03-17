import { NodeProperties, Red } from 'node-red';
import { resolve } from 'path';

import { DatabaseSqlite } from '../lib/database-sqlite';
import { IDbConfigNode, IDBProperties } from './common';

export = (RED: Red) => {
    RED.nodes.registerType('mysensorsdb', function MysensorsDb(this: IDbConfigNode, props: NodeProperties) {
        const config = props as IDBProperties;
        RED.nodes.createNode(this, config);
        this.file = config.file;
        try {
            if (this.file) {
                this.database = new DatabaseSqlite(this.file);
            }
        } catch (error) {
            if (error.code === 'SQLITE_CANTOPEN') {
                this.error(`${error.name}: ${error.message} ${resolve(config.file || '')}`);
                return;
           }
            throw error;
        }

        this.on('close', () => {
            this.database.close();
        });
    });
};
