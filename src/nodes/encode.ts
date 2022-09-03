import { NodeAPI } from 'node-red';

import { MysensorsMqtt } from '../lib/decoder/mysensors-mqtt';
import { MysensorsSerial } from '../lib/decoder/mysensors-serial';
import { IMysensorsMsg, validateStrongMysensorsMsg } from '../lib/mysensors-msg';
import { IDecodeEncodeConf, IEncodeProperties } from './common';

export = (RED: NodeAPI) => {
    RED.nodes.registerType(
        'mysencode',
        function (this: IDecodeEncodeConf, props: IEncodeProperties) {
            RED.nodes.createNode(this, props);
            if (props.mqtt) {
                this.decoder = new MysensorsMqtt();
            } else {
                this.decoder = new MysensorsSerial();
            }
            this.on('input', (msg: IMysensorsMsg, send, done) => {
                if (props.mqtttopic !== '') {
                    msg.topicRoot = props.mqtttopic;
                }
                if (validateStrongMysensorsMsg(msg)) {
                    send(this.decoder.encode(msg));
                }
                done();
            });
        },
    );
}
