import { IMysensorsMsg, INodeMessage, MsgOrigin } from '../mysensors-msg';
import { NullCheck } from '../nullcheck';
import { MysensorsMqtt } from './mysensors-mqtt';
import { MysensorsSerial } from './mysensors-serial';

export async function AutoDecode(msg: Readonly<IMysensorsMsg>): Promise<IMysensorsMsg> {
    if (NullCheck.isUndefinedOrNull(msg.nodeId)) {
        let msgTmp: IMysensorsMsg | undefined;
        if (!msg.topic) {
            msgTmp = await new MysensorsSerial().decode(msg as INodeMessage);
        } else {
            msgTmp = await new MysensorsMqtt().decode(msg as INodeMessage);
        }
        if (msgTmp) {
            return msgTmp;
        }
    }
    return {
        ...msg,
        origin: MsgOrigin.decoded
    };
}
