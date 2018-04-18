import { Red } from "node-red";
import { Controler } from "../lib/controler";
import { MysensorsMsg } from "../lib/mysensors-msg";

function registerMysensorControler(RED: Red) {
    function MysensorsControler(config: any) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.file = config.file;
        this.database = RED.nodes.getNode(config.database)
        let node = this;
        node.controler = new Controler(node.database.file);
        node.on('input', function(msg: MysensorsMsg) {
            node.send((node.controler as Controler).messageHandler(msg));
        });
    }
    RED.nodes.registerType('myscontroler', MysensorsControler);
}

export = registerMysensorControler;