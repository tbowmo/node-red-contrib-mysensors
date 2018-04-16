export function MysensorsDecodeSerial(msg: MySensors.IMessage): MySensors.IMessage {
    
    var message = msg.payload.toString();
    message = message.replace(/(\r\n|\n|\r)/gm, "");
    var tokens = message.split(";");
    let msgOut: MySensors.IMessage;

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