import { Red } from 'node-red';
import { MysensorsMsg } from '../lib/mysensors-msg';
import { MysensorsMqtt } from '../lib/mysensors-mqtt';
import { MysensorsSerial } from '../lib/mysensors-serial';

function registerEncode(RED: Red) {
    function MysensorsEncode(config: any) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.mqtt = config.mqtt;
        this.topicRoot = config.mqtttopic;
        this.on('input', function(msg: MysensorsMsg) {
            let msgOut: MysensorsMsg;
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