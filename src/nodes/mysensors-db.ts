import { Node, Red } from "node-red";
import { IDbConfigNode, IDBProperties } from "./common";

export = (RED: Red) => {
    RED.nodes.registerType('mysensorsdb', function MysensorsDb(this: IDbConfigNode, config: IDBProperties) {
        RED.nodes.createNode(this, config);
        this.file = config.file;
    });
}
