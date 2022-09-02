import { IMysensorsMsg, INodeMessage, MsgOrigin } from '../mysensors-msg';
import { NullCheck } from '../nullcheck';
import { IDecoder } from './decoder-interface';
import { MysensorsDecoder } from './mysensors-decoder';

export class MysensorsMqtt extends MysensorsDecoder implements IDecoder {

    public async decode(msg: INodeMessage): Promise<IMysensorsMsg| undefined> {
        if (msg.topic) {
            const msgOut = msg as IMysensorsMsg;
            const split = msg.topic.toString().split('/');
            if (split.length >= 6) {
                msgOut.topicRoot = split.slice(0, split.length - 5).join('/');
                msgOut.nodeId = parseInt( split[split.length - 5], 10 );
                msgOut.childSensorId = parseInt( split[split.length - 4], 10 );
                msgOut.messageType = parseInt( split[split.length - 3], 10 );
                msgOut.ack = (split[split.length - 2] === '1') ? 1 : 0;
                msgOut.subType = parseInt( split[split.length - 1], 10 );
                msgOut.origin = MsgOrigin.mqtt;
                return await this.enrich(msgOut);
            }
        }
    }

    public encode(msg: IMysensorsMsg): IMysensorsMsg| undefined {
        if (NullCheck.isDefinedOrNonNull(msg.nodeId)) {
            msg.topic =  (msg.topicRoot ? (msg.topicRoot + '/') : '')
                + msg.nodeId + '/'
                + msg.childSensorId + '/'
                + msg.messageType + '/'
                + msg.ack + '/'
                + msg.subType;
            return msg;
        }
    }
}
