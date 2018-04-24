import { Node, Red } from 'node-red';
import { MysensorsMsg, MysensorsMsgNull } from '../lib/mysensors-msg';
import { MysensorsMqtt } from '../lib/mysensors-mqtt';
import { MysensorsSerial } from '../lib/mysensors-serial';
import { IEncodeProperties } from './common';

export = (RED: Red) => {
    RED.nodes.registerType('mysencode', function(this: Node, props: IEncodeProperties) {
        RED.nodes.createNode(this, props);
        this.on('input', (msg: MysensorsMsg) => {
            let msgOut: MysensorsMsgNull = null;
            if (props.mqtt) {
                if (props.topicRoot !== "") {
                    msg.topicRoot = props.topicRoot;
                }
                
                if ('nodeId' in msg) {
                    msgOut = MysensorsMqtt.encode(msg);
                }
            }
            else {
                if ('nodeId' in msg) {
                    msgOut = MysensorsSerial.encode(msg);
                }
            }
            this.send(msgOut);
        });
    });
};
