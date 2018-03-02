module.exports = function(RED) {
    function MysensorsDecode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.mqtt = config.mqtt;
        this.on('input', function(msg) {
            if (this.mqtt) {
                var topic = msg.topic.toString();
                var split = topic.split("/");
                if (split.length < 6)
                {
                    node.error("Illegal MQTT topic", msg);
                } else {
                    msg.topicRoot       = split.slice(0,split.length-5).join("/");
                        
                    msg.nodeId          = parseInt( split[split.length-5] );
                    msg.childSensorId   = parseInt( split[split.length-4] );
                    msg.messageType     = parseInt( split[split.length-3] );
                    msg.ack             = parseInt( split[split.length-2] );
                    msg.subType         = parseInt( split[split.length-1] );
                    delete msg.topic;
                }
            }
            else {
                var message = msg.payload.toString();
                message = message.replace(/(\r\n|\n|\r)/gm, "");
                var tokens = message.split(";")
    
                msg.rawData = tokens;
                if(tokens.length == 6)
                {
                    msg.nodeId = parseInt(tokens[0]);
                    msg.childSensorId = parseInt(tokens[1]);
                    msg.messageType = parseInt(tokens[2]);
                    msg.ack = parseInt(tokens[3]);
                    msg.subType = parseInt(tokens[4]);
                    msg.payload = tokens[5];
                }
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("mysdecode",MysensorsDecode);
}

