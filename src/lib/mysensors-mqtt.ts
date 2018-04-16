export function MysensorsDecodeMQTT(msg: any): MySensors.IMessage {
    
    let topic = msg.topic.toString();
    let split = topic.split("/");
    let msgOut: MySensors.IMessage;
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
