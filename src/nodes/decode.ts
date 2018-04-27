import { Node, NodeProperties, Red } from 'node-red';
import { MysensorsMqtt } from '../lib/mysensors-mqtt';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import { MysensorsSerial } from '../lib/mysensors-serial';
import { IDecodeProperties } from './common';

export = (RED: Red) => {
    RED.nodes.registerType('mysdecode', function(this: Node, props: NodeProperties) {
        const config = props as IDecodeProperties;
        RED.nodes.createNode(this, config);
        this.on('input', (msg: IMysensorsMsg) => {
            if (config.mqtt) {
                this.send(MysensorsMqtt.decode(msg));
            } else {
                this.send(MysensorsSerial.decode(msg));
            }
        });
    });
};
