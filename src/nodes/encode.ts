import { NodeProperties, Red } from 'node-red';

import { MysensorsMqtt } from '../lib/decoder/mysensors-mqtt';
import { MysensorsSerial } from '../lib/decoder/mysensors-serial';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import { IDecodeEncodeConf, IEncodeProperties } from './common';

export = (RED: Red) => {
    RED.nodes.registerType('mysencode', function(this: IDecodeEncodeConf, props: NodeProperties) {
        const config = props as IEncodeProperties;
        RED.nodes.createNode(this, config);
        if (config.mqtt) {
            this.decoder = new MysensorsMqtt();
        } else {
            this.decoder = new MysensorsSerial();
        }
        this.on('input', (msg: IMysensorsMsg) => {
            if (config.mqtttopic !== '') {
                msg.topicRoot = config.mqtttopic;
            }
            this.send(this.decoder.encode(msg));
        });
    });
};
