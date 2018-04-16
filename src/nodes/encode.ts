import { Red } from 'node-red';

function registerEncode(RED: Red) {
    function MysensorsEncode(config: any) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.mqtt = config.mqtt;
        this.topicRoot = config.mqtttopic;
        this.on('input', function(msg: MySensors.IMessage) {
            if (this.mqtt) {
                if (this.topicRoot !== "") {
                    msg.topicRoot = this.topicRoot;
                }
                if ('nodeId' in msg) {
                    var topic =  ((msg.topicRoot) ? (msg.topicRoot + "/") : "") + msg.nodeId + "/" + msg.childSensorId + "/" + msg.messageType + "/" + msg.ack + "/" + msg.subType;
                    msg.topic = topic;
                }
            }
            else {
                if ('nodeId' in msg) {
                    let pl = msg.nodeId+";"+msg.childSensorId+";"+msg.messageType+";"+msg.ack+";"+msg.subType+";"+msg.payload;
                    msg.payload = pl;
                }
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("mysencode",MysensorsEncode);
}

export = registerEncode;