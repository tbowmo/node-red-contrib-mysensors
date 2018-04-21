import { MysensorsMsg, MysensorsMsgNull } from './mysensors-msg'
import { mysensor_command, mysensor_internal } from "./mysensors-types";
import { open, Database } from 'sqlite';
import { NullCheck } from './nullcheck';
import { MysensorsMqtt } from './mysensors-mqtt';
import { MysensorsSerial } from './mysensors-serial';

export class Controler {
    private dbPromise: Promise<Database>;
    private tick: any;

    constructor(private dbname: string, private reconnect: number = 2000) {
        if (NullCheck.isUndefinedNullOrEmpty(this.dbname)) {
            throw('No dbname set');
        }
        this.dbPromise = open(this.dbname);       
    }

    public async messageHandler(msg: MysensorsMsg): Promise<MysensorsMsgNull> {
        const db = await this.dbPromise;
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
        await db.all(`insert or ignore into node (id) values (${msg.nodeId})`, []);
        await db.all(`update node set lastHeard=CURRENT_TIMESTAMP where id=${msg.nodeId}`);
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

    private async handleIdRequest(msg: MysensorsMsg): Promise<MysensorsMsg> {
        msg.subType = mysensor_internal.I_ID_RESPONSE;
        msg.payload = "20";
        return msg;
    }

    private async handleDebug(msg: MysensorsMsg): Promise<void> {

    }

    private async handleSketchVersion(msg: MysensorsMsg): Promise<void>{
        const db = await this.dbPromise;
        let sql: string = '';
        if(msg.subType === mysensor_internal.I_SKETCH_VERSION) {
            sql = `update node set sketchVersion="${msg.payload}" where id=${msg.nodeId}`;
        } else if (msg.subType === mysensor_internal.I_SKETCH_NAME) {
            sql = `update node set sketchName="${msg.payload}" where id=${msg.nodeId}`;
        }
        await db.all(sql, []);
    }
}
