module.exports = function(RED) {
    function EncodeDecode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.on('input', function(msg) {
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
            else
            {
                if ('nodeId' in msg) {
                    pl = msg.nodeId+";"+msg.childSensorId+";"+msg.messageType+";"+msg.ack+";"+msg.subType+";"+msg.payload;
                    msg = {payload:pl};
                }
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("mysdecenc",EncodeDecode);
}

