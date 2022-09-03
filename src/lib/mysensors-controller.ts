import { IStorage } from './storage-interface';
import { AutoDecode } from './decoder/auto-decode';
import { IDecoder } from './decoder/decoder-interface';
import { MysensorsMqtt } from './decoder/mysensors-mqtt';
import { MysensorsSerial } from './decoder/mysensors-serial';
import { IMysensorsMsg, IStrongMysensorsMsg, MsgOrigin, MysensorsCommand } from './mysensors-msg';
import { mysensor_command, mysensor_internal } from './mysensors-types';
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
        IncommingMsg: Readonly<IMysensorsMsg>,
    ): Promise<IMysensorsMsg | undefined> {
        const msg = await AutoDecode(IncommingMsg);

        if (!msg) {
            return;
        }

        this.updateHeard(msg);

        if (
            msg.messageType === mysensor_command.C_PRESENTATION
        ) {
            await this.database.child(
                msg.nodeId,
                msg.childSensorId,
                msg.subType,
                msg.payload as string,
            );
        }

        if (msg.messageType !== mysensor_command.C_INTERNAL) {
            return;
        }

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

    private async updateHeard(msg: Readonly<IStrongMysensorsMsg<MysensorsCommand>>) {
        await this.database.nodeHeard(msg.nodeId);
        await this.database.childHeard(msg.nodeId, msg.childSensorId);
    }

    private async handleConfig(
        msg: Readonly<IStrongMysensorsMsg<mysensor_command.C_INTERNAL>>,
    ): Promise<IStrongMysensorsMsg<mysensor_command.C_INTERNAL> | undefined> {
        if (this.measurementSystem !== 'N') {
            const newMsg = {
                ...msg,
                payload: this.measurementSystem
            };
            return newMsg;
        }
    }

    private async handleTimeResponse(
        msg: Readonly<IStrongMysensorsMsg<mysensor_command.C_INTERNAL>>,
    ): Promise<IStrongMysensorsMsg<mysensor_command.C_INTERNAL> | undefined> {
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
        msg: Readonly<IStrongMysensorsMsg<mysensor_command.C_INTERNAL>>,
    ): Promise<IStrongMysensorsMsg<mysensor_command.C_INTERNAL> | undefined> {
        if (this.handleIds) {
            const newMsg = {
                ...msg,
                subType: mysensor_internal.I_ID_RESPONSE,
                payload: (await this.database.getFreeNodeId()).toString()
            };
            return newMsg;
        }
    }

    private async handleDebug(msg: Readonly<IStrongMysensorsMsg<mysensor_command.C_INTERNAL>>): Promise<void> {
        const r = /TSF:MSG:READ,(\d+)-(\d+)-(\d+)/;
        const m = r.exec(msg.payload as string);
        if (m) {
            this.database.setParent(Number(m[1]), Number(m[2]));
        }
    }

    private async handleBattery(msg: Readonly<IStrongMysensorsMsg<mysensor_command.C_INTERNAL>>): Promise<void> {
        await this.database.setBatteryLevel(msg.nodeId, Number(msg.payload));
    }

    private async handleSketchVersion(msg: Readonly<IStrongMysensorsMsg<mysensor_command.C_INTERNAL>>): Promise<void> {
        if (msg.subType === mysensor_internal.I_SKETCH_VERSION) {
            this.database.sketchVersion(msg.nodeId, msg.payload as string);
        } else if (msg.subType === mysensor_internal.I_SKETCH_NAME) {
            this.database.sketchName(msg.nodeId, msg.payload as string);
        }
    }

    private encode(msg: Readonly<IStrongMysensorsMsg<MysensorsCommand>> | undefined) {
        if (!msg) {
            return;
        }

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
