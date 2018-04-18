import { MysensorsMqtt } from "../lib/mysensors-mqtt";
import { MysensorsSerial } from "../lib/mysensors-serial";
import { Red } from 'node-red';
import { FullMsg } from "../lib/message";

function registerDecode(RED: Red) {
    function MysensorsDecode(config: any) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.mqtt = config.mqtt;
        this.on('input', function(msg: FullMsg) {
            let msgOut: FullMsg;
            if (this.mqtt) {
                msgOut = MysensorsMqtt.decode(msg);
            } 
            else {
                msgOut = MysensorsSerial.decode(msg);
            }
            node.send(msgOut);
        });
    }
    RED.nodes.registerType("mysdecode",MysensorsDecode);
}

export = registerDecode;
