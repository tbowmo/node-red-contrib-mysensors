import { Red } from "node-red";

function registerMysensorControler(RED: Red) {
    function MysensorsControler(config: any) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.file = config.file;
        this.database = RED.nodes.getNode(config.database)
    }
    RED.nodes.registerType('myscontroler', MysensorsControler);
}

export = registerMysensorControler;