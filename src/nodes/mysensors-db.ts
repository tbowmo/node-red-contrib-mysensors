import { Red } from "node-red";

function registerMysensorsDb(RED: Red) {
    function MysensorsDb(config: any) {
        RED.nodes.createNode(this, config);
        this.file = config.file;
    }
    RED.nodes.registerType('mysensorsdb', MysensorsDb);
}

export = registerMysensorsDb;