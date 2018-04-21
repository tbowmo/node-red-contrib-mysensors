import { Red } from "node-red";
import { Controler } from "../lib/controler";
import { MysensorsMsg, MysensorsMsgNull } from "../lib/mysensors-msg";
import { IControlerConfig, IControlerProperties, IDbConfigNode } from "./common";

export = (RED: Red) => {
    RED.nodes.registerType('myscontroler', function (this: IControlerConfig, props: IControlerProperties) {
        RED.nodes.createNode(this, props);
        if (props.database) {
            this.database = RED.nodes.getNode(props.database);
            if (this.database.file) {
                this.controler = new Controler(this.database.file);
                this.on('input', (msg: MysensorsMsg) => {
                    (this.controler as Controler).messageHandler(msg).then((msg: MysensorsMsgNull) => {
                        this.send(msg);
                    });
                });
            }
        }
    });
}
