import { Node, Red, NodeProperties } from 'node-red';
import { IDbConfigNode, IDBProperties } from './common';
import { Database } from '../lib/database';
import { resolve } from 'path';

export = (RED: Red) => {
    RED.nodes.registerType('mysensorsdb', function MysensorsDb(this: IDbConfigNode, props: NodeProperties) {
        const config = props as IDBProperties;
        RED.nodes.createNode(this, config);
        this.file = config.file;
        try {
            if (this.file) {
                this.database = new Database(this.file);
            }
        } catch (error) {
            if(error.code === 'SQLITE_CANTOPEN') {
                this.error(`${error.name}: ${error.message} ${resolve(config.file || '')}`);
                return;
           }
           throw error;
        }

        this.on('close', () => {
            this.database.close();
        });
    });
}
