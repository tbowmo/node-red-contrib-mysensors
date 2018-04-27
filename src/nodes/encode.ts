import { Node, NodeProperties, Red } from 'node-red';
import { MysensorsMqtt } from '../lib/mysensors-mqtt';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import { MysensorsSerial } from '../lib/mysensors-serial';
import { IEncodeProperties } from './common';

export = (RED: Red) => {
    RED.nodes.registerType('mysencode', function(this: Node, props: NodeProperties) {
        const config = props as IEncodeProperties;
        RED.nodes.createNode(this, config);
        this.on('input', (msg: IMysensorsMsg) => {
            if (config.mqtt) {
                if (config.mqtttopic !== '') {
                    msg.topicRoot = config.mqtttopic;
                }

                if ('nodeId' in msg) {
                    this.send(MysensorsMqtt.encode(msg));
                }
            } else {
                if ('nodeId' in msg) {
                    this.send(MysensorsSerial.encode(msg));
                }
            }
        });
    });
};
