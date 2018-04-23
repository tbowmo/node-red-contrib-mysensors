import { MysensorsMsg, MysensorsMsgNull } from './mysensors-msg'
import { mysensor_command, mysensor_internal } from "./mysensors-types";
import { NullCheck } from './nullcheck';
import { MysensorsMqtt } from './mysensors-mqtt';
import { MysensorsSerial } from './mysensors-serial';
import { Database } from './database';

export class MysensorsControler {

    constructor(private database: Database, private handleIds: boolean) { }


    public async messageHandler(msg: MysensorsMsg): Promise<MysensorsMsgNull> {
        let msgOut: MysensorsMsgNull = null;
        let inputType = 0;
        if (NullCheck.isUndefinedOrNull(msg.nodeId)) {
            let msgTmp: MysensorsMsgNull;
            if(NullCheck.isUndefinedNullOrEmpty(msg.topic)) {
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
        if (msg.nodeId) await this.database.nodeHeard(msg.nodeId);
        if (msg.messageType === mysensor_command.C_INTERNAL) {
            switch (msg.subType) {
                case mysensor_internal.I_ID_REQUEST:
                    msgOut = await this.handleIdRequest(msg);
                    break;
                case mysensor_internal.I_SKETCH_NAME:
                case mysensor_internal.I_SKETCH_VERSION:
                    await this.handleSketchVersion(msg);
                    break;
                case mysensor_internal.I_DEBUG:
                    await this.handleDebug(msg);
                    break;
            };            
        }
        if (NullCheck.isDefinedOrNonNull(msgOut)) {
            if (inputType === 1) {
                msgOut = MysensorsSerial.encode(msgOut);
            } else if (inputType === 2) {
                msgOut = MysensorsMqtt.encode(msgOut);
                if (NullCheck.isDefinedOrNonNull(msgOut)) {
                    msgOut.topicRoot = msg.topicRoot;
                }
            }
        }
        return msgOut;
    }

    private async handleIdRequest(msg: MysensorsMsg): Promise<MysensorsMsg | null> {
        msg.subType = mysensor_internal.I_ID_RESPONSE;
        if (this.handleIds) {
            msg.payload = (await this.database.getFreeNodeId()).toString();
            return msg;
        }
        return null;
    }

    private async handleDebug(msg: MysensorsMsg): Promise<void> {

    }

    private async handleSketchVersion(msg: MysensorsMsg): Promise<void>{
        let sql: string = '';
        if(msg.subType === mysensor_internal.I_SKETCH_VERSION && msg.nodeId) {
            this.database.sketchVersion(msg.nodeId, msg.payload);
        } else if (msg.subType === mysensor_internal.I_SKETCH_NAME && msg.nodeId) {
            this.database.sketchName(msg.nodeId, msg.payload);
        }
    }

}

