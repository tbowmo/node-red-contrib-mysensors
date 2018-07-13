import { IDatabase } from 'node-red-contrib-mysensors/src/lib/database.interface';
import { IMysensorsMsg } from '../mysensors-msg';
import {
    mysensor_command,
    mysensor_data,
    mysensor_internal,
    mysensor_sensor,
    mysensor_stream,
    } from '../mysensors-types';
import { NullCheck } from '../nullcheck';

export abstract class MysensorsDecoder {
    protected enrichWithDb: boolean;

    constructor(enrich?: boolean, private database?: IDatabase) {
        this.enrichWithDb = enrich || false;
    }

    protected async enrich(msg: IMysensorsMsg): Promise<IMysensorsMsg> {
        if (NullCheck.isDefinedOrNonNull(msg.messageType)) {
            msg.messageTypeStr = mysensor_command[msg.messageType];
        }
        if (NullCheck.isDefinedOrNonNull(msg.subType)) {
            switch (msg.messageType) {
                case mysensor_command.C_INTERNAL:
                    msg.subTypeStr = mysensor_internal[msg.subType];
                    break;
                case mysensor_command.C_PRESENTATION:
                    msg.subTypeStr = mysensor_sensor[msg.subType];
                    break;
                case mysensor_command.C_REQ:
                case mysensor_command.C_SET:
                    msg.subTypeStr = mysensor_data[msg.subType];
                    break;
                case mysensor_command.C_STREAM:
                    msg.subTypeStr = mysensor_stream[msg.subType];
            }
        }
        if (this.enrichWithDb &&
            NullCheck.isDefinedOrNonNull(msg.nodeId) &&
            NullCheck.isDefinedOrNonNull(msg.childSensorId) &&
            NullCheck.isDefinedOrNonNull(this.database)) {
                const res = await this.database.getChild(msg.nodeId, msg.childSensorId);
                if (NullCheck.isDefinedOrNonNull(res)) {
                    msg.sensorTypeStr = mysensor_sensor[res.sType];
                }
        }
        return msg;
    }
}
