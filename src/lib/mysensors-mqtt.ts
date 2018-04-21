import { MysensorsMsg, MysensorsMsgNull } from "./mysensors-msg";
import { NullCheck } from "./nullcheck";

export class MysensorsMqtt {

    public static decode(msg: MysensorsMsg): MysensorsMsgNull {
        if (NullCheck.isDefinedNonNullAndNotEmpty(msg.topic)) {
            let split = msg.topic.toString().split('/');
            let msgOut: MysensorsMsg| null = null;
            if (split.length >= 6)
            {
                msgOut = {
                    topicRoot: split.slice(0,split.length-5).join("/"),
                    nodeId: parseInt( split[split.length-5] ),
                    childSensorId: parseInt( split[split.length-4] ),
                    messageType: parseInt( split[split.length-3] ),
                    ack: split[split.length-2] === '1'? 1 : 0,
                    subType: parseInt( split[split.length-1] ),
                    payload: msg.payload
                };
            }
            return msgOut;
        }
        return null;
    }

    public static encode(msg: MysensorsMsg): MysensorsMsgNull {
        let msgOut: MysensorsMsgNull = null;
        if (NullCheck.isDefinedOrNonNull(msg.nodeId)) {
            msgOut = {
                topic: (NullCheck.isDefinedNonNullAndNotEmpty(msg.topicRoot) ? (msg.topicRoot + "/") : "") + msg.nodeId + "/" + msg.childSensorId + "/" + msg.messageType + "/" + msg.ack + "/" + msg.subType,
                payload: msg.payload
            }
        }
        return msgOut;
    }
}
