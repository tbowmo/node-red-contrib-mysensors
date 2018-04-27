import { IMysensorsMsg, INodeMessage } from './mysensors-msg';
import { NullCheck } from './nullcheck';

export class MysensorsMqtt {

    public static decode(msg: INodeMessage): IMysensorsMsg| undefined {
        if (NullCheck.isDefinedNonNullAndNotEmpty(msg.topic)) {
            const msgOut = msg as IMysensorsMsg;
            const split = msg.topic.toString().split('/');
            if (split.length >= 6) {
                msgOut.topicRoot = split.slice(0, split.length - 5).join('/');
                msgOut.nodeId = parseInt( split[split.length - 5], 10 );
                msgOut.childSensorId = parseInt( split[split.length - 4], 10 );
                msgOut.messageType = parseInt( split[split.length - 3], 10 );
                msgOut.ack = (split[split.length - 2] === '1') ? 1 : 0;
                msgOut.subType = parseInt( split[split.length - 1], 10 );
                return msgOut;
            }
        }
    }

    public static encode(msg: IMysensorsMsg): INodeMessage| undefined {
        if (NullCheck.isDefinedOrNonNull(msg.nodeId)) {
            msg.topic =  (NullCheck.isDefinedNonNullAndNotEmpty(msg.topicRoot) ? (msg.topicRoot + '/') : '')
                + msg.nodeId + '/'
                + msg.childSensorId + '/'
                + msg.messageType + '/'
                + msg.ack + '/'
                + msg.subType;
            return msg;
        }
    }
}
