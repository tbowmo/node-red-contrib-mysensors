import { Node, NodeProperties, NodeId } from "node-red";
import { Controler } from "node-red-contrib-mysensors/src/lib/controler";
import { MysensorsMsg } from "node-red-contrib-mysensors/src/lib/mysensors-msg";
import { mysensor_sensor } from "node-red-contrib-mysensors/src/lib/mysensors-types";

/* Encode */
export interface IEncodeProperties extends NodeProperties {
    mqtt?: boolean;
    topicRoot?: string;
}

/* Decode */
export interface IDecodeProperties extends NodeProperties {
    mqtt?: boolean;
}

/* DB */ 
export interface IDbConfigNode extends Node {
    file?: string;
}

export interface IDBProperties extends NodeProperties {
    file?: string;
}

/* Controler */
export interface IControlerProperties extends NodeProperties {
    database?: NodeId;
}

export interface IControlerConfig extends Node {
    controler: Controler;
    database: IDbConfigNode;
}

/* Encapsulate */
export interface IEncapsulateConfig extends Node {
    sensor: MysensorsMsg;
    presentation: boolean;
    presentationtext: string;
    presentationtype: mysensor_sensor;
    fullpresentation: boolean;
    internal: number;
    firmwarename: string;
    firmwareversion: string;

}

export interface IEncapsulateProperties extends NodeProperties {
    nodeId?: number;
    childId?: number
    subType?: number;
    msgtype?: number;
    ack?: boolean;
    presentation?: boolean;
    presentationtext?: string;
    presentationtype?: number;
    fullpresentation?: boolean;
    internal?: number;
    firmwarename?: string;
    firmwareversion?: string;
}