import { NodeAPI } from 'node-red';

import { NoderedStorage } from '../lib/nodered-storage';
import { IDbConfigNode, IDBProperties } from './common';

export = (RED: NodeAPI) => {
    RED.nodes.registerType(
        'mysensorsdb',
        function MysensorsDb(this: IDbConfigNode, props: IDBProperties) {
            RED.nodes.createNode(this, props);
            this.contextType = props.contextType || 'flow';
            this.contextKey = RED.util.parseContextStore(props.store);
            const myContext = this.context()[this.contextType];

            this.database = new NoderedStorage(myContext, this.contextKey.key, this.contextKey.store );

            this.on('close', () => {
                this.database.close();
            });
        },
    );
}
