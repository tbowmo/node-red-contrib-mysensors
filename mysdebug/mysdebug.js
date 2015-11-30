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
                        msgSubType = mys_common.presentation[subType];
                        break;
                    case 1:
                        msgHeader = "SET";
                        msgSubType = mys_common.subtype[subType];
                        break;
                    case 2:
                        msgHeader = "GET";
                        msgSubType = mys_common.subtype[subType];
                        break;
                    case 3:
                        if (subType == 9) msg.payload = "GW Debug;" + debugDecode(payload);
                        else {
                            msgHeader = "INTERNAL";
                            msgSubType = mys_common.internal[subType];
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
            if (msg.payload != null && nodeId == 0) node.send(msg);
        });
    }
    RED.nodes.registerType("mysdebug",Debugger);
}


function debugDecode(payload) {
    var payReturn = payload;
    var commands = ['Presentation','SET','GET','Internal','Stream'];
    var re = /(.+?):\s(.+?)\s(.+?):(.+)/; 
    var str = payload
    var index;
    var cmd = 0;
    var m;
    if ((m = re.exec(str)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        p = m[2].split('-');
        payReturn = m[1];
        if (m[1] == 'send') {
            payReturn = payReturn + ";Sender="+p[0];
            payReturn = payReturn + ";Last="+p[1];
            payReturn = payReturn + ";To="+p[2];
            payReturn = payReturn + ";Dest="+p[3];            
        } else {
            payReturn = payReturn + ";Sender="+p[0];
            payReturn = payReturn + ";Last="+p[1];
            payReturn = payReturn + ";Destination="+p[2];
        }
        p = m[3].split(',');
        for (index = 0; index < p.length;index++) {
            x = p[index].split('=');
            console.log(x[0] + ":" + x[1]);
            switch (x[0]) {
                case 's': z = "ChildId="+x[1];
                    break;
                case 'c' : z = "Command="+commands[x[1]];
                    cmd = x[1];
                    break;
                case 't' : 
                    var sub = mys_common.subtype[x[1]];
                    if (cmd == 0) sub = mys_common.presentation[x[1]];
                    if (cmd == 3) sub = mys_common.internal[x[1]];
                    z = "subType=" + sub; 
                    break;
                case 'pt' :
                    z = "PayloadType="+mys_common.payloadtype[x[1]];
                    break;
                case 'l' :
                    z = 'Length='+x[1];
                    break;
                case 'sg': 
                    z = "Signing=" + (x[1]==1?'Signed':'Unsigned');
                    break;
                default: z = p[index];
            }
            payReturn = payReturn + ";" + z;
        } 
        
        payReturn = payReturn + ";Payload="+m[4];
                     // View your result using the m-variable.
                         // eg m[0] etc.
    }
    return payReturn;
}