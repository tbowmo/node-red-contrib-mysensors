import { MysensorsMsg } from "./mysensors-msg";

export class MysensorsMqtt {

    public static decode(msg: MysensorsMsg): MysensorsMsg {
        let split = msg.topic.toString().split('/');
        let msgOut: MysensorsMsg;
        if (split.length >= 6)
        {
            msgOut = {
                topicRoot: split.slice(0,split.length-5).join("/"),
                nodeId: parseInt( split[split.length-5] ),
                childSensorId: parseInt( split[split.length-4] ),
                messageType: parseInt( split[split.length-3] ),
                ack: parseInt( split[split.length-2] ),
                subType: parseInt( split[split.length-1] ),
                payload: msg.payload
            };
        }
        return msgOut;
    }

    public static encode(msg: MysensorsMsg): MysensorsMsg {
        const msgOut: MysensorsMsg = {
            topic: ((msg.topicRoot) ? (msg.topicRoot + "/") : "") + msg.nodeId + "/" + msg.childSensorId + "/" + msg.messageType + "/" + msg.ack + "/" + msg.subType,
            payload: msg.payload
        }
        return msgOut;
    }
}
