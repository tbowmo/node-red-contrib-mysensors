import { IMysensorsMsg, MsgOrigin } from '../mysensors-msg';
import { NullCheck } from '../nullcheck';
import { MysensorsMqtt } from './mysensors-mqtt';
import { MysensorsSerial } from './mysensors-serial';

export async function AutoDecode(msg: IMysensorsMsg): Promise<IMysensorsMsg> {
    if (NullCheck.isUndefinedOrNull(msg.nodeId)) {
        let msgTmp: IMysensorsMsg | undefined;
        if (NullCheck.isUndefinedNullOrEmpty(msg.topic)) {
            msgTmp = await new MysensorsSerial().decode(msg);
        } else {
            msgTmp = await new MysensorsMqtt().decode(msg);
        }
        if (NullCheck.isDefinedOrNonNull(msgTmp)) {
            msg = msgTmp;
        } else {
            msg.origin = MsgOrigin.decoded;
        }
    }
    return msg;
}
