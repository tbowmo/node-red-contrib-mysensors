import { IMysensorsMsg, INodeMessage, IStrongMysensorsMsg, MsgOrigin, MysensorsCommand } from '../mysensors-msg';
import { NullCheck } from '../nullcheck';
import { MysensorsMqtt } from './mysensors-mqtt';
import { MysensorsSerial } from './mysensors-serial';

export async function AutoDecode(
    msg: Readonly<IMysensorsMsg>
): Promise<IStrongMysensorsMsg<MysensorsCommand> | undefined> {
    if (NullCheck.isDefinedOrNonNull(msg.nodeId) && NullCheck.isDefinedOrNonNull(msg.messageType)) {
        return {
            ...msg,
            origin: MsgOrigin.decoded,
        } as IStrongMysensorsMsg<MysensorsCommand>;
    }

    if (!msg.topic) {
        return new MysensorsSerial().decode(msg as INodeMessage);
    } else {
        return new MysensorsMqtt().decode(msg as INodeMessage);
    }
}
