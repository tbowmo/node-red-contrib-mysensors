import { MysensorsDecodeMQTT } from "../lib";
import { MysensorsDecodeSerial } from "../lib";
import { Red } from 'node-red';

function registerDecode(RED: Red) {
    function MysensorsDecode(config: any) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.mqtt = config.mqtt;
        this.on('input', function(msg: MySensors.IMessage) {
            if (this.mqtt) {
                let msgOut = MysensorsDecodeMQTT(msg);
                node.send(msgOut);
            } 
            else {
                let msgOut = MysensorsDecodeSerial(msg);
                node.send(msgOut);
            }
        });
    }
    RED.nodes.registerType("mysdecode",MysensorsDecode);
}

export = registerDecode;
