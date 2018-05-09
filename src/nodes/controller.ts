import { Red } from 'node-red';
import { Database } from '../lib/database-sqlite';
import { MysensorsController } from '../lib/mysensors-controller';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import { IControlerConfig, IControlerProperties, IDbConfigNode } from './common';

export = (RED: Red) => {
    RED.nodes.registerType('myscontroler', function(this: IControlerConfig, props: IControlerProperties) {
        RED.nodes.createNode(this, props);
        if (props.database) {
            this.database = RED.nodes.getNode(props.database) as IDbConfigNode;
            if (this.database.database) {
                this.controler = new MysensorsController(this.database.database, props.handleid || false);
                this.on('input', (msg: IMysensorsMsg) => {
                    (this.controler).messageHandler(msg).then((msgOut: IMysensorsMsg| undefined) => {
                        this.send(msgOut);
                    });
                });
            }
        }
    });

    RED.httpAdmin.get('/mysensornodes/:id', RED.auth.needsPermission(''), async (req: any , res: any) => {
        const dbNode = RED.nodes.getNode(req.params.id) as IDbConfigNode;
        if (dbNode.database) {
            const x = await dbNode.database.getNodeList();
            res.json(JSON.stringify({data: x}));
        }
    });
};
