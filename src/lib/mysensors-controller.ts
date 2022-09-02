import { IStorage } from './storage-interface';
import { AutoDecode } from './decoder/auto-decode';
import { IDecoder } from './decoder/decoder-interface';
import { MysensorsMqtt } from './decoder/mysensors-mqtt';
import { MysensorsSerial } from './decoder/mysensors-serial';
import { IMysensorsMsg, MsgOrigin } from './mysensors-msg';
import { mysensor_command, mysensor_internal } from './mysensors-types';
import { NullCheck } from './nullcheck';
import { utcToZonedTime } from 'date-fns-tz';

export class MysensorsController {
    constructor(
        private database: IStorage,
        private handleIds: boolean,
        private timeResponse: boolean,
        private timeZone: string,
        private measurementSystem: string,
        private mqttRoot: string,
    ) {}

    public async messageHandler(
        msg: Readonly<IMysensorsMsg>,
    ): Promise<IMysensorsMsg | undefined> {
        msg = await AutoDecode(msg);
        if (NullCheck.isDefinedOrNonNull(msg.nodeId)) {
            await this.database.nodeHeard(msg.nodeId);
            if (NullCheck.isDefinedOrNonNull(msg.childSensorId)) {
                await this.database.childHeard(msg.nodeId, msg.childSensorId);
            }
        }

        if (
            msg.messageType === mysensor_command.C_PRESENTATION &&
            NullCheck.isDefinedOrNonNull(msg.childSensorId) &&
            NullCheck.isDefinedOrNonNull(msg.nodeId) &&
            NullCheck.isDefinedOrNonNull(msg.subType)
        ) {
            await this.database.child(
                msg.nodeId,
                msg.childSensorId,
                msg.subType,
                msg.payload as string,
            );
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
            case mysensor_internal.I_BATTERY_LEVEL:
                await this.handleBattery(msg);
                break;
            }
        }
    }

    private async handleConfig(
        msg: Readonly<IMysensorsMsg>,
    ): Promise<IMysensorsMsg | undefined> {
        if (this.measurementSystem !== 'N') {
            const newMsg = {
                ...msg,
                payload: this.measurementSystem
            };
            return newMsg;
        }
    }

    private async handleTimeResponse(
        msg: Readonly<IMysensorsMsg>,
    ): Promise<IMysensorsMsg | undefined> {
        const msgCopy = {...msg};
        msgCopy.subType = mysensor_internal.I_TIME;
        if (this.timeResponse && msg.messageType) {
            if (this.timeZone === 'Z') {
                msgCopy.payload = Math.trunc(new Date().getTime() / 1000).toString();
            } else {
                msgCopy.payload = Math.trunc(utcToZonedTime(new Date(), this.timeZone).getTime() / 1000).toString();
            }
            return msgCopy;
        }
    }

    private async handleIdRequest(
        msg: Readonly<IMysensorsMsg>,
    ): Promise<IMysensorsMsg | undefined> {
        if (this.handleIds) {
            const newMsg = {
                ...msg,
                subType: mysensor_internal.I_ID_RESPONSE,
                payload: (await this.database.getFreeNodeId()).toString()
            };
            return newMsg;
        }
    }

    private async handleDebug(msg: Readonly<IMysensorsMsg>): Promise<void> {
        const r = /TSF:MSG:READ,(\d+)-(\d+)-(\d+)/;
        const m = r.exec(msg.payload as string);
        if (NullCheck.isDefinedOrNonNull(m)) {
            this.database.setParent(Number(m[1]), Number(m[2]));
        }
    }

    private async handleBattery(msg: Readonly<IMysensorsMsg>): Promise<void> {
        if (NullCheck.isDefinedOrNonNull(msg.nodeId)) {
            await this.database.setBatteryLevel(msg.nodeId, Number(msg.payload));
        }
    }

    private async handleSketchVersion(msg: Readonly<IMysensorsMsg>): Promise<void> {
        if (msg.subType === mysensor_internal.I_SKETCH_VERSION && msg.nodeId) {
            this.database.sketchVersion(msg.nodeId, msg.payload as string);
        } else if (
            msg.subType === mysensor_internal.I_SKETCH_NAME &&
            msg.nodeId
        ) {
            this.database.sketchName(msg.nodeId, msg.payload as string);
        }
    }

    private encode(msg: Readonly<IMysensorsMsg> | undefined) {
        if (NullCheck.isDefinedOrNonNull(msg)) {
            let encoder: IDecoder | undefined;

            if (msg.origin === MsgOrigin.serial) {
                encoder = new MysensorsSerial();
            } else if (msg.origin === MsgOrigin.mqtt) {
                encoder = new MysensorsMqtt();
            }
            if (!encoder) {
                return msg;
            }
            return encoder.encode({...msg, topicRoot: this.mqttRoot});
        }
    }
}
