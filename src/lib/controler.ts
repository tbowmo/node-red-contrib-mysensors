import { FullMsg } from './message'
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
            this.doConnect();
        }
    }

    private doConnect() {
        this.db = new Database(this.dbname);
        this.db.on('open', function() {
            if (this.tick) { clearTimeout(this.tick); }
            this.log("opened "+this.dbname+" ok");
        });
        this.db.on('error', (err: any) => {
            this.tick = setTimeout(function() { this.doConnect(); }, this.reconnect);
        });
    }

    public close() {
        if (this.tick) { clearTimeout(this.tick); }
        if (this.db) { this.db.close(); }      
    }

    public messageHandler(msg: FullMsg): FullMsg {
        if (NullCheck.isUndefinedOrNull(msg.nodeId)) {
            if(NullCheck.isUndefinedNullOrEmpty(msg.topic)) {
                msg = MysensorsSerial.decode(msg);
            } else {
                msg = MysensorsMqtt.decode(msg);
            }
        }
        if (msg.messageType === mysensor_command.C_INTERNAL) {
            switch (msg.subType) {
                case mysensor_internal.I_ID_REQUEST:
                    return this.handleIdRequest(msg);
                case mysensor_internal.I_DEBUG:
                    this.handleDebug(msg);
                    return null
            };            
        }
        return null;
    }

    private handleIdRequest(msg: FullMsg): FullMsg {
        msg.subType = mysensor_internal.I_ID_RESPONSE;
        msg.payload = "20";
        this.db.all('', [], function(err, row) {});
        return msg;
    }

    private handleDebug(msg: FullMsg) {

    }
}
