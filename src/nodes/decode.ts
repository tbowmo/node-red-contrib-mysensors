import { IDecodeProperties } from './common';
import { MysensorsMqtt } from '../lib/mysensors-mqtt';
import { MysensorsMsg, MysensorsMsgNull } from '../lib/mysensors-msg';
import { MysensorsSerial } from '../lib/mysensors-serial';
import { Node, Red } from 'node-red';

export = (RED: Red) => {
    RED.nodes.registerType("mysdecode", function (this: Node, config: IDecodeProperties) {
        RED.nodes.createNode(this, config);
        config.mqtt;
        this.on('input', (msg: MysensorsMsg) => {
            let msgOut: MysensorsMsgNull;
            if (config.mqtt) {
                msgOut = MysensorsMqtt.decode(msg);
            } 
            else {
                msgOut = MysensorsSerial.decode(msg);
            }
            this.send(msgOut);
        });
    });
}
