import { IStorage } from '../storage-interface'
import { IStrongMysensorsMsg, MysensorsCommand } from '../mysensors-msg'
import {
    mysensor_command,
    mysensor_data,
    mysensor_internal,
    mysensor_sensor,
    mysensor_stream,
} from '../mysensors-types'
import { NullCheck } from '../nullcheck'

export abstract class MysensorsDecoder {
    protected enrichWithDb: boolean

    constructor(enrich?: boolean, private database?: IStorage) {
        this.enrichWithDb = enrich && !!database || false
    }

    protected async enrich(msg: IStrongMysensorsMsg<MysensorsCommand>): Promise<IStrongMysensorsMsg<MysensorsCommand>> {
        const newMsg: IStrongMysensorsMsg<MysensorsCommand> = {
            ...msg,
        }
        newMsg.messageTypeStr = mysensor_command[msg.messageType]
        switch (msg.messageType)
        {
        case mysensor_command.C_INTERNAL:
            newMsg.subTypeStr = mysensor_internal[msg.subType]
            break
        case mysensor_command.C_PRESENTATION:
            newMsg.subTypeStr = mysensor_sensor[msg.subType]
            break
        case mysensor_command.C_REQ:
        case mysensor_command.C_SET:
            newMsg.subTypeStr = mysensor_data[msg.subType]
            break
        case mysensor_command.C_STREAM:
            newMsg.subTypeStr = mysensor_stream[msg.subType]
            break
        }
        if (this.enrichWithDb && this.database)
        {
            const res = await this.database.getChild(msg.nodeId, msg.childSensorId)
            if (NullCheck.isDefinedOrNonNull(res)) {
                newMsg.sensorTypeStr = mysensor_sensor[res.sType]
            }
        }

        return newMsg
    }
}
