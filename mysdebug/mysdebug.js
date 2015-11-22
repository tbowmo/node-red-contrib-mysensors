var mys_common = require ('mysensors_common');
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
                if (messageType==3) {
                    if(subType==9) {
                        msg.payload = payload;
                    } else {
                        msg.payload = "INTERNAL :SensorId=" + nodeId + ":ChildId="+mys_common.internal[subType].htext + ":Payload=" + payload;
                    }
                }
                if (messageType==0) {
                    msg.payload = "PRESENTATION :SensorId=" + nodeId + ":ChildId=" + childSensorId+":"+mys_common.presentation[subType].htext+":Payload="+payload
                }                            
                if (messageType==1 || messageType==2) {
                    msg.payload = "";
                    if (messageType==1) msg.payload = "SET :";
                    else msg.payload = "GET :";
                    msg.payload = msg.payload + "SensorId="+ nodeId + ":ChildId=" + childSensorId + ":" + mys_common.subtype[subType].htext + ":Payload=" + payload;
                }
                
                
            }
            if (msg.payload != null) node.send(msg);
        });
    }
    RED.nodes.registerType("mysdebug",Debugger);
}

