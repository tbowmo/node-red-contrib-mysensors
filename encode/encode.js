module.exports = function(RED) {
    function MysensorsEncode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.mqtt = config.mqtt;
        this.on('input', function(msg) {
            if (this.mqtt) {
                if ('nodeId' in msg) {
                    var topic =  ((msg.topicRoot) ? (msg.topicRoot + "/") : "") + msg.nodeId + "/" + msg.childSensorId + "/" + msg.messageType + "/" + msg.ack + "/" + msg.subType;
                    msg.topic = topic;
                }
            }
            else {
                if ('nodeId' in msg) {
                    pl = msg.nodeId+";"+msg.childSensorId+";"+msg.messageType+";"+msg.ack+";"+msg.subType+";"+msg.payload;
                    msg = {payload:pl};
                }
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("mysencode",MysensorsEncode);
}

