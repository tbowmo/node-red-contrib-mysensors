import {
    IMysensorsMsg,
    INodeMessage,
    IStrongMysensorsMsg,
    MsgOrigin,
    MysensorsCommand,
    validateStrongMysensorsMsg,
} from '../mysensors-msg'
import { MysensorsMqtt } from './mysensors-mqtt'
import { MysensorsSerial } from './mysensors-serial'

export async function AutoDecode(
    msg: Readonly<IMysensorsMsg>,
): Promise<IStrongMysensorsMsg<MysensorsCommand> | undefined> {
    if (validateStrongMysensorsMsg(msg)) {
        return {
            ...msg,
            origin: MsgOrigin.decoded,
        }
    }

    if (!msg.topic) {
        return new MysensorsSerial().decode(msg as INodeMessage)
    } else {
        return new MysensorsMqtt().decode(msg as INodeMessage)
    }
}
