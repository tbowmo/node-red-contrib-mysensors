import { Node, NodeProperties, Red } from 'node-red';
import { MysensorsMqtt } from '../lib/decoder/mysensors-mqtt';
import { MysensorsSerial } from '../lib/decoder/mysensors-serial';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import { IDecodeEncodeConf, IDecodeProperties } from './common';

export = (RED: Red) => {
    RED.nodes.registerType('mysdecode', function(this: IDecodeEncodeConf, props: NodeProperties) {
        const config = props as IDecodeProperties;
        if (config.mqtt) {
            this.decoder = new MysensorsMqtt();
        } else {
            this.decoder = new MysensorsSerial();
        }
        RED.nodes.createNode(this, config);
        this.on('input', (msg: IMysensorsMsg) => {
            this.send(this.decoder.decode(msg));
        });
    });
};
