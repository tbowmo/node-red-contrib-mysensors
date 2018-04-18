import { FullMsg } from "./message";

export class MysensorsSerial {
    public static decode(msg: FullMsg): FullMsg {
        var message = msg.payload.toString();
        message = message.replace(/(\r\n|\n|\r)/gm, "");
        var tokens = message.split(";");
        let msgOut: FullMsg;

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

    public static encode(msg: FullMsg): FullMsg {
        const msgOut: FullMsg = {
            payload: msg.nodeId+";"+msg.childSensorId+";"+msg.messageType+";"+msg.ack+";"+msg.subType+";"+msg.payload,
        }
        return msgOut;
    }
}