import { NodeAPI } from 'node-red';

import { MysensorsController } from '../lib/mysensors-controller';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import {
    IControllerConfig,
    IControllerProperties,
    IDbConfigNode,
} from './common';

/* istanbul ignore next */
export = (RED: NodeAPI): void => {
    RED.nodes.registerType(
        'myscontroller',
        function (this: IControllerConfig, props: IControllerProperties): void {
            RED.nodes.createNode(this, props);

            if (!props.database) {
                return;
            }

            this.database = RED.nodes.getNode(
                props.database,
            ) as IDbConfigNode;
            
            this.controller = new MysensorsController(
                this.database.database,
                props.handleid ?? false,
                props.timeresponse ?? true,
                props.timezone ?? 'UTC',
                props.measurementsystem ?? 'M',
                props.mqttroot ?? 'mys-out',
                props.addSerialNewline ?? false,
            );

            this.on('input', async (msg: IMysensorsMsg, send, done) => {
                try {
                    const msgOut = await this.controller.messageHandler(msg);
                    if (msgOut) {
                        send(msgOut);
                    }
                    done();
                } catch (err) {
                    done(err as Error);
                }
            });
        },
    );

    RED.httpAdmin.get(
        '/mysensornodes/:database',
        RED.auth.needsPermission(''),
        async (req, res) => {
            const dbNode = RED.nodes.getNode(
                req.params.database,
            ) as IDbConfigNode;
            if (dbNode.database) {
                const x = await dbNode.database.getNodeList();
                res.json(JSON.stringify({ data: x }));
            }
        },
    );
}
