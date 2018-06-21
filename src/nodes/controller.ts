import { Red } from 'node-red';
import { MysensorsController } from '../lib/mysensors-controller';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import { IControllerConfig, IControllerProperties, IDbConfigNode } from './common';

export = (RED: Red) => {
    RED.nodes.registerType('myscontroller', function(this: IControllerConfig, props: IControllerProperties) {
        RED.nodes.createNode(this, props);
        if (props.database) {
            this.database = RED.nodes.getNode(props.database) as IDbConfigNode;
            if (this.database.database) {
                this.controller = new MysensorsController(
                    this.database.database,
                    props.handleid || false,
                    props.timeresponse || true,
                    props.timezone || 'UTC',
                    props.measurementsystem || 'M',
                    props.mqttroot || 'mys-out',
                );
                this.on('input', (msg: IMysensorsMsg) => {
                    (this.controller).messageHandler(msg).then((msgOut: IMysensorsMsg| undefined) => {
                        this.send(msgOut);
                    });
                });
            }
        }
    });

    RED.httpAdmin.get('/mysensornodes/:database', RED.auth.needsPermission(''), async (req: any , res: any) => {
        const dbNode = RED.nodes.getNode(req.params.database) as IDbConfigNode;
        if (dbNode.database) {
            const x = await dbNode.database.getNodeList();
            res.json(JSON.stringify({data: x}));
        }
    });
};
