import { IMysensorsMsg, INodeMessage, MsgOrigin } from '../mysensors-msg';
import { NullCheck } from '../nullcheck';
import { MysensorsDecoder } from './mysensors-decoder';

export class MysensorsSerial extends MysensorsDecoder {
    public decode(msg: INodeMessage): IMysensorsMsg| undefined {
        let message = msg.payload.toString();
        message = message.replace(/(\r\n|\n|\r)/gm, '');
        const tokens = message.split(';');
        const msgOut = msg as IMysensorsMsg;
        if (tokens.length === 6) {
            msgOut.nodeId = parseInt(tokens[0], 10);
            msgOut.childSensorId = parseInt(tokens[1], 10);
            msgOut.messageType = parseInt(tokens[2], 10);
            msgOut.ack = tokens[3] === '1' ? 1 : 0;
            msgOut.subType = parseInt(tokens[4], 10);
            msgOut.payload = tokens[5];
            msgOut.origin = MsgOrigin.serial;
            return this.enrich(msgOut);
        }
    }

    public encode(msg: IMysensorsMsg): INodeMessage| undefined {
        if (NullCheck.isDefinedOrNonNull(msg) && NullCheck.isDefinedOrNonNull(msg.nodeId)) {
            msg.payload = msg.nodeId + ';'
                + msg.childSensorId + ';'
                + msg.messageType + ';'
                + msg.ack + ';'
                + msg.subType + ';'
                + msg.payload;
            return msg;
        }
    }
}
