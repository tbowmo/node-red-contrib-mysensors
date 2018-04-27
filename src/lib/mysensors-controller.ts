import { Database } from './database';
import { MysensorsMqtt } from './mysensors-mqtt';
import { IMysensorsMsg } from './mysensors-msg';
import { MysensorsSerial } from './mysensors-serial';
import { mysensor_command, mysensor_internal } from './mysensors-types';
import { NullCheck } from './nullcheck';

export class MysensorsController {

    constructor(private database: Database, private handleIds: boolean) { }

    public async messageHandler(msg: IMysensorsMsg): Promise<IMysensorsMsg | undefined> {
        let inputType = 0;
        if (NullCheck.isUndefinedOrNull(msg.nodeId)) {
            let msgTmp: IMysensorsMsg | undefined;
            if (NullCheck.isUndefinedNullOrEmpty(msg.topic)) {
                inputType = 1;
                msgTmp = MysensorsSerial.decode(msg);
            } else {
                inputType = 2;
                msgTmp = MysensorsMqtt.decode(msg);
            }
            if (NullCheck.isDefinedOrNonNull(msgTmp)) {
                msg = msgTmp;
            }
        }

        if (msg.nodeId) {
            await this.database.nodeHeard(msg.nodeId);
        }

        if (msg.messageType === mysensor_command.C_INTERNAL) {
            switch (msg.subType) {
                case mysensor_internal.I_ID_REQUEST:
                    return this.encode(await this.handleIdRequest(msg), inputType);
                case mysensor_internal.I_SKETCH_NAME:
                case mysensor_internal.I_SKETCH_VERSION:
                    await this.handleSketchVersion(msg);
                    break;
                case mysensor_internal.I_LOG_MESSAGE:
                    await this.handleDebug(msg);
                    break;
            }
        }
    }

    private encode(msg: IMysensorsMsg| undefined, inputType: number) {
        if (NullCheck.isDefinedOrNonNull(msg)) {
            if (inputType === 1) {
                msg = MysensorsSerial.encode(msg);
            } else if (inputType === 2) {
                msg = MysensorsMqtt.encode(msg);
            }
        }
        return msg;
    }

    private async handleIdRequest(msg: IMysensorsMsg): Promise<IMysensorsMsg | undefined> {
        msg.subType = mysensor_internal.I_ID_RESPONSE;
        if (this.handleIds) {
            msg.payload = (await this.database.getFreeNodeId()).toString();
            return msg;
        }
    }

    private async handleDebug(msg: IMysensorsMsg): Promise<void> {
        const r = /TSF:MSG:READ,(\d+)-(\d+)-(\d+)/;
        const m = r.exec(msg.payload);
        if (NullCheck.isDefinedOrNonNull(m)) {
            this.database.setParent(m[1], m[2]);
        }
    }

    private async handleSketchVersion(msg: IMysensorsMsg): Promise<void> {
        const sql: string = '';
        if (msg.subType === mysensor_internal.I_SKETCH_VERSION && msg.nodeId) {
            this.database.sketchVersion(msg.nodeId, msg.payload);
        } else if (msg.subType === mysensor_internal.I_SKETCH_NAME && msg.nodeId) {
            this.database.sketchName(msg.nodeId, msg.payload);
        }
    }

}
