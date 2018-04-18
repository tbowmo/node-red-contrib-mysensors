import { FullMsg } from "./message";

export class MysensorsMqtt {

    public static decode(msg: FullMsg): FullMsg {
    
        let topic = msg.topic.toString();
        let split = topic.split("/");
        let msgOut: FullMsg;
        if (split.length < 6)
        {
            throw('');
        } else {
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

    public static encode(msg: FullMsg): FullMsg {
        const msgOut: FullMsg = {
            topic: ((msg.topicRoot) ? (msg.topicRoot + "/") : "") + msg.nodeId + "/" + msg.childSensorId + "/" + msg.messageType + "/" + msg.ack + "/" + msg.subType,
            payload: msg.payload
        }
        return msgOut;
    }
}
