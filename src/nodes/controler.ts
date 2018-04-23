import { Red } from "node-red";
import { MysensorsControler } from "../lib/mysensors-controler";
import { MysensorsMsg, MysensorsMsgNull } from "../lib/mysensors-msg";
import { IControlerConfig, IControlerProperties, IDbConfigNode } from "./common";
import { Database } from "../lib/database";

export = (RED: Red) => {
    RED.nodes.registerType('myscontroler', function (this: IControlerConfig, props: IControlerProperties) {
        RED.nodes.createNode(this, props);
        if (props.database) {
            this.database = RED.nodes.getNode(props.database) as IDbConfigNode;
            if (this.database.database) {
                this.controler = new MysensorsControler(this.database.database, props.handleid || false);
                this.on('input', (msg: MysensorsMsg) => {
                    (this.controler as MysensorsControler).messageHandler(msg).then((msg: MysensorsMsgNull) => {
                        this.send(msg);
                    });
                });
            }
        }
    });

    RED.httpAdmin.get("/mysensornodes/:id", RED.auth.needsPermission(''), async(req: any , res: any) => {
        const dbNode = RED.nodes.getNode(req.params.id) as IDbConfigNode;
       if (dbNode.database) {
            const x = await dbNode.database.getNodeList();
            res.json(JSON.stringify({data:x}));
        }
    });
}
