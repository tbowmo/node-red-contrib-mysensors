import { Red } from "node-red";
import { Controler } from "../lib/controler";
import { FullMsg } from "../lib/message";

function registerMysensorControler(RED: Red) {
    function MysensorsControler(config: any) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.file = config.file;
        this.database = RED.nodes.getNode(config.database)
        this.controler = new Controler('/tmp/database');
        let node = this;
        node.on('input', function(msg: FullMsg) {
            node.send(node.controler.message(msg));
        });
    }
    RED.nodes.registerType('myscontroler', MysensorsControler);
}

export = registerMysensorControler;