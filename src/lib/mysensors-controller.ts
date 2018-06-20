import * as moment from 'moment-timezone';
import { IDatabase } from './database.interface';
import { AutoDecode } from './decoder/auto-decode';
import { IDecoder } from './decoder/decoder.interface';
import { MysensorsMqtt } from './decoder/mysensors-mqtt';
import { MysensorsSerial } from './decoder/mysensors-serial';
import { IMysensorsMsg, MsgOrigin } from './mysensors-msg';
import { mysensor_command, mysensor_internal } from './mysensors-types';
import { NullCheck } from './nullcheck';

export class MysensorsController {

    constructor(
        private database: IDatabase,
        private handleIds: boolean,
        private timeResponse: boolean,
        private timeZone: string,
        private measurementSystem: string,
    ) { }

    public async messageHandler(msg: IMysensorsMsg): Promise<IMysensorsMsg | undefined> {
        msg = AutoDecode(msg);
        if (NullCheck.isDefinedOrNonNull(msg.nodeId)) {
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
                case mysensor_internal.I_TIME:
                    return this.encode(await this.handleTimeResponse(msg));
                case mysensor_internal.I_CONFIG:
                    return this.encode(await this.handleConfig(msg));
            }
        }
    }

    private async handleConfig(msg: IMysensorsMsg): Promise<IMysensorsMsg | undefined> {
        if (this.measurementSystem !== 'N') {
            msg.payload = this.measurementSystem;
            return msg;
        }
    }

    private async handleTimeResponse(msg: IMysensorsMsg): Promise<IMysensorsMsg | undefined> {
        msg.subType = mysensor_internal.I_TIME;
        if (this.timeResponse && msg.messageType) {
            const offset = this.getTzOffsetSeconds();
            let sec = Number(moment().tz(this.timeZone).format('X'));
            sec = sec + offset;
            msg.payload = sec.toString();
            return msg;
        }
    }

    private getTzOffsetSeconds(): number {
        const tzData = moment().tz(this.timeZone).format('Z').split(':');
        let seconds = (Number(tzData[0].substr(1)) * 60 + Number(tzData[1])) * 60;
        if (tzData[0].substr(0, 1) === '-') {
            seconds = seconds * -1;
        }
        return seconds;
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
        if (encoder === undefined || msg === undefined) {
            return msg;
        }
        return encoder.encode(msg);
    }
}
