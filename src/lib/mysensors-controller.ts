import { IDatabase } from './database.interface';
import { AutoDecode } from './decoder/auto-decode';
import { IDecoder } from './decoder/decoder.interface';
import { MysensorsDecoder } from './decoder/mysensors-decoder';
import { MysensorsMqtt } from './decoder/mysensors-mqtt';
import { MysensorsSerial } from './decoder/mysensors-serial';
import { IMysensorsMsg, MsgOrigin } from './mysensors-msg';
import { mysensor_command, mysensor_internal } from './mysensors-types';
import { NullCheck } from './nullcheck';

export class MysensorsController {

    constructor(private database: IDatabase, private handleIds: boolean) { }

    public async messageHandler(msg: IMysensorsMsg): Promise<IMysensorsMsg | undefined> {
        msg = AutoDecode(msg);
        if (msg.nodeId) {
            await this.database.nodeHeard(msg.nodeId);
        }

        if (msg.messageType === mysensor_command.C_INTERNAL) {
            switch (msg.subType) {
                case mysensor_internal.I_ID_REQUEST:
                    return this.encode(await this.handleIdRequest(msg));
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

    private encode(msg: IMysensorsMsg| undefined) {
        let encoder: IDecoder| undefined;
        if (NullCheck.isDefinedOrNonNull(msg)) {
            if (msg.origin === MsgOrigin.serial) {
                encoder = new MysensorsSerial();
            } else if (msg.origin === MsgOrigin.mqtt) {
                encoder = new MysensorsMqtt();
            }
        }
        if (encoder === undefined || msg === undefined) { return msg; }
        return encoder.encode(msg);
    }
}
