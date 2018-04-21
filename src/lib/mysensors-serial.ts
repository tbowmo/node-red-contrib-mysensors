import { MysensorsMsg, MysensorsMsgNull } from "./mysensors-msg";
import { NullCheck } from "./nullcheck";

export class MysensorsSerial {
    public static decode(msg: MysensorsMsg): MysensorsMsgNull {
        if (NullCheck.isUndefinedOrNull(msg)) {return msg}
        let message = msg.payload.toString();
        message = message.replace(/(\r\n|\n|\r)/gm, "");
        let tokens = message.split(";");
        let msgOut: MysensorsMsgNull = null;

        if(tokens.length == 6)
        {
            msgOut = {
                nodeId: parseInt(tokens[0]),
                childSensorId: parseInt(tokens[1]),
                messageType: parseInt(tokens[2]),
                ack: tokens[3] === '1'? 1:0,
                subType: parseInt(tokens[4]),
                payload: tokens[5]
            };
        }
        return msgOut;
    }

    public static encode(msg: MysensorsMsg): MysensorsMsgNull {
        let msgOut: MysensorsMsgNull = null;
        if (NullCheck.isDefinedOrNonNull(msg) && NullCheck.isDefinedOrNonNull(msg.nodeId)) {
            msgOut = {payload: msg.nodeId+";"+msg.childSensorId+";"+msg.messageType+";"+msg.ack+";"+msg.subType+";"+msg.payload}
        }
        return msgOut;
    }
}
