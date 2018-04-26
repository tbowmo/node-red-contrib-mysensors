import { IDecodeProperties } from './common';
import { MysensorsMqtt } from '../lib/mysensors-mqtt';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import { MysensorsSerial } from '../lib/mysensors-serial';
import { Node, Red, NodeProperties } from 'node-red';

export = (RED: Red) => {
    RED.nodes.registerType('mysdecode', function (this: Node, props: NodeProperties) {
        const config = props as IDecodeProperties
        RED.nodes.createNode(this, config);
        config.mqtt;
        this.on('input', (msg: IMysensorsMsg) => {
            if (config.mqtt) {
                this.send(MysensorsMqtt.decode(msg));
            } 
            else {
                this.send(MysensorsSerial.decode(msg));
            }
        });
    });
}
