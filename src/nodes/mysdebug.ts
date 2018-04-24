import { mysensor_sensor, mysensor_data, mysensor_internal, mysensor_stream, mysensor_command, mysensor_payload } from '../lib/mysensors-types';
import { Node, Red, NodeProperties } from 'node-red'
import { MysensorsMsg, MysensorsMsgDefined } from '../lib/mysensors-msg';
import { NullCheck } from '../lib/nullcheck';

export = (RED: Red) => {
    RED.nodes.registerType("mysdebug", function (this: Node, config: NodeProperties) {
        RED.nodes.createNode(this,config);

        this.on('input', (msg: MysensorsMsg) => {
            let message = msg.payload.toString();
            message = message.replace('\\n','');
            let tokens = message.split(";")
            msg.payload = "";
            if (tokens.length == 6)
            {
                const m: MysensorsMsgDefined = {
                    nodeId: parseInt(tokens[0]),
                    childSensorId: parseInt(tokens[1]),
                    messageType: parseInt(tokens[2]),
                    ack: tokens[3] === "1"? 1: 0,
                    subType: parseInt(tokens[4]),
                    payload: tokens[5]
                };
                let msgHeader = '';
                let msgSubType: string | null = null;
                switch (m.messageType) {
                    case mysensor_command.C_PRESENTATION:
                        msgHeader = "PRESENTATION";
                        msgSubType = mysensor_sensor[m.subType];
                        break;
                    case mysensor_command.C_SET:
                        msgHeader = "SET";
                        msgSubType = mysensor_data[m.subType];
                        break;
                    case mysensor_command.C_REQ:
                        msgHeader = "REQ";
                        msgSubType = mysensor_data[m.subType];
                        break;
                    case mysensor_command.C_INTERNAL:
                        if (m.subType == 9) msg.payload = "GW Debug;" + debugDecode(m.payload);
                        else {
                            msgHeader = "INTERNAL";
                            msgSubType = mysensor_internal[m.subType];
                        }
                        break;
                    case mysensor_command.C_STREAM:
                        msgHeader = "STREAM";
                        msgSubType = mysensor_stream[m.subType];
                        break;
                    default:
                        msg.payload = "unsupported msgType " + m.messageType;
                        break;
                }

                if (msgSubType != null) {
                    msg.payload = msgHeader + ";nodeId:" + m.nodeId + ";childId:"+ m.childSensorId +";SubType:"+ msgSubType + ";ACK:"+ m.ack + ";Payload:"+ m.payload;
                }

            }
            this.send(msg);
        });
    });
}

function debugDecode(payload: string) {
    let payReturn = payload;
    let commands = ['Presentation','SET','GET','Internal','Stream'];
    let re = /(.+?):\s(.+?)\s(.+?):(.+)/;
    let str = NullCheck.isUndefinedOrNull(payload)?'': payload;
    let index: number;
    let cmd: number = 0;
    let m: RegExpExecArray| null;
    let z: string;
    if ((m = re.exec(str))) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        let p = m[2].split('-');
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
            const x = p[index].split('=');
            console.log(x[0] + ":" + x[1]);
            const i = Number(x[1]);
            switch (x[0]) {
                case 's': 
                    z = "ChildId=" + x[1];
                    break;
                case 'c' :
                    z = "Command=" + commands[i];
                    cmd = Number(x[1]);
                    break;
                case 't' :
                    let sub = mysensor_command[i];
                    if (cmd == 0) sub = mysensor_sensor[i];
                    if (cmd == 3) sub = mysensor_internal[i];
                    z = "subType=" + sub;
                    break;
                case 'pt' :
                    z = "PayloadType=" + mysensor_payload[i];
                    break;
                case 'l' :
                    z = 'Length=' + i;
                    break;
                case 'sg':
                    z = "Signing=" + (i==1?'Signed':'Unsigned');
                    break;
                default: z = p[index];
            }
            payReturn = payReturn + ";" + z;
        }

        payReturn = payReturn + ";Payload="+m[4];
    }
    return payReturn;
}
