var mys_common = require ('../mysensors-defines.json');
module.exports = function(RED) {
    function Debugger(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.on('input', function(msg) {
            var message = msg.payload.toString();
            message = message.replace('\\n','');
            var tokens = message.split(";")
            msg.payload = null;    
            if(tokens.length == 6)
            {
                var nodeId = parseInt(tokens[0]);
                var childSensorId = parseInt(tokens[1]);
                var messageType = parseInt(tokens[2]);
                var ack = parseInt(tokens[3]);
                var subType = parseInt(tokens[4]);
                var payload = tokens[5];
                var subTypeText = null;
                var msgHeader = '';
                var msgSubType = null;
                switch (messageType) {
                    case 0:
                        msgHeader = "PRESENTATION";
                        msgSubType = mys_common.presentation[subType].htext;
                        break;
                    case 1:
                        msgHeader = "SET";
                        msgSubType = mys_common.subtype[subType].htext;
                        break;
                    case 2:
                        msgHeader = "GET";
                        msgSubType = mys_common.subtype[subType].htext;
                        break;
                    case 3:
                        if (subType == 9) msg.payload = "GW Debug;" + payload;
                        else {
                            msgHeader = "INTERNAL";
                            msgSubType = mys_common.internal[subType].htext;
                        }
                        break;
                    default:
                        msg.payload = "unsupported msgType " + messageType; 
                        break;   
                                                                       
                }
                if (msgSubType != null) {
                    msg.payload = msgHeader + ";nodeId:" + nodeId + ";childId:"+ childSensorId +";SubType:"+ msgSubType + ";ACK:"+ ack + ";Payload:"+ payload;
                }
                
            }
            if (msg.payload != null) node.send(msg);
        });
    }
    RED.nodes.registerType("mysdebug",Debugger);
}

