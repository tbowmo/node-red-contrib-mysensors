import { MysensorsMsg } from "./mysensors-msg";

export class MysensorsSerial {
    public static decode(msg: MysensorsMsg): MysensorsMsg {
        var message = msg.payload.toString();
        message = message.replace(/(\r\n|\n|\r)/gm, "");
        var tokens = message.split(";");
        let msgOut: MysensorsMsg;

        if(tokens.length == 6)
        {
            msgOut = {
                nodeId: parseInt(tokens[0]),
                childSensorId: parseInt(tokens[1]),
                messageType: parseInt(tokens[2]),
                ack: parseInt(tokens[3]),
                subType: parseInt(tokens[4]),
                payload: tokens[5]
            };
        }
        return msgOut;
    }

    public static encode(msg: MysensorsMsg): MysensorsMsg {
        const msgOut: MysensorsMsg = {
            payload: msg.nodeId+";"+msg.childSensorId+";"+msg.messageType+";"+msg.ack+";"+msg.subType+";"+msg.payload,
        }
        return msgOut;
    }
}