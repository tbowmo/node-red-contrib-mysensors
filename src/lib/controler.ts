import { MysensorsMsg } from './mysensors-msg'
import { mysensor_command, mysensor_internal } from "./mysensors-types";
import { Database } from 'sqlite3';
import { NullCheck } from './nullcheck';
import { MysensorsMqtt } from './mysensors-mqtt';
import { MysensorsSerial } from './mysensors-serial';

export class Controler {
    private db: Database;
    private tick: any;

    constructor(private dbname: string, private reconnect: number = 2000) {
        if (NullCheck.isDefinedNonNullAndNotEmpty(this.dbname)) {
            console.log(this.dbname);
            this.doConnect();
        }
    }

    private doConnect() {
        this.db = new Database(this.dbname);
        this.db.on('open', () => {
            if (this.tick) { clearTimeout(this.tick); }
            this.db.all(`CREATE TABLE if not exists node (
                id integer PRIMARY KEY AUTOINCREMENT,
                sketchName varchar,
                sketchVersion varchar,
                lastHeard timestamp,
                parentId integer
            );`);
            this.db.all(`CREATE TABLE if not exists child (
                id integer,
                nodeId integer,
                sType integer
            );
            `);
        });
        this.db.on('error', (err: any) => {
            this.tick = setTimeout(function() { this.doConnect(); }, this.reconnect);
        });
    }

    public close() {
        if (this.tick) { clearTimeout(this.tick); }
        if (this.db) { this.db.close(); }      
    }

    public messageHandler(msg: MysensorsMsg): MysensorsMsg {
        let inputType = 0;
        let msgOut: MysensorsMsg = null;
        if (NullCheck.isUndefinedOrNull(msg.nodeId)) {
            if(NullCheck.isUndefinedNullOrEmpty(msg.topic)) {
                inputType = 1;
                msg = MysensorsSerial.decode(msg);
            } else {
                inputType = 2;
                msg = MysensorsMqtt.decode(msg);
            }
        }
        this.db.all(`insert or ignore into node (id) values (${msg.nodeId})`, []);
        this.db.all(`update node set lastHeard=CURRENT_TIMESTAMP where id=${msg.nodeId}`);
        if (msg.messageType === mysensor_command.C_INTERNAL) {
            switch (msg.subType) {
                case mysensor_internal.I_ID_REQUEST:
                    msgOut = this.handleIdRequest(msg);
                    break;
                case mysensor_internal.I_SKETCH_NAME:
                case mysensor_internal.I_SKETCH_VERSION:
                    this.handleSketchVersion(msg);
                    break;
                case mysensor_internal.I_DEBUG:
                    this.handleDebug(msg);
                    break;
            };            
        }

        if (inputType === 1) {
            msgOut = MysensorsSerial.encode(msgOut);
        } else if (inputType === 2) {
            msgOut = MysensorsMqtt.encode(msgOut);
        }
        return msgOut;
    }

    private handleIdRequest(msg: MysensorsMsg): MysensorsMsg {
        msg.subType = mysensor_internal.I_ID_RESPONSE;
        msg.payload = "20";
        return msg;
    }

    private handleDebug(msg: MysensorsMsg): void {

    }

    private handleSketchVersion(msg: MysensorsMsg): void{
        let sql: string = '';
        if(msg.subType === mysensor_internal.I_SKETCH_VERSION) {
            sql = `update node set sketchVersion="${msg.payload}" where id=${msg.nodeId}`;
        } else if (msg.subType === mysensor_internal.I_SKETCH_NAME) {
            sql = `update node set sketchName="${msg.payload}" where id=${msg.nodeId}`;
        }
        this.db.all(sql, [], (err, row)=> {

        });
    }
}
