import { Red } from 'node-red';
import { FullMsg } from '../lib/message';
import { MysensorsMqtt } from '../lib/mysensors-mqtt';
import { MysensorsSerial } from '../lib/mysensors-serial';

function registerEncode(RED: Red) {
    function MysensorsEncode(config: any) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.mqtt = config.mqtt;
        this.topicRoot = config.mqtttopic;
        this.on('input', function(msg: FullMsg) {
            let msgOut: FullMsg;
            if (this.mqtt) {
                if (this.topicRoot !== "") {
                    msg.topicRoot = this.topicRoot;
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
            node.send(msgOut);
        });
    }
    RED.nodes.registerType("mysencode",MysensorsEncode);
}

export = registerEncode;