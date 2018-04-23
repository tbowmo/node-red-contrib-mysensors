import { Node, NodeProperties, NodeId } from "node-red";
import { MysensorsControler } from "../lib/mysensors-controler";
import { MysensorsMsg } from "../lib/mysensors-msg";
import { mysensor_sensor } from "../lib/mysensors-types";
import { Database } from "../lib/database";

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
    database: Database
}

export interface IDBProperties extends NodeProperties {
    file?: string;
}

/* Controler */
export interface IControlerProperties extends NodeProperties {
    database?: NodeId;
    handleid?: boolean;
}

export interface IControlerConfig extends Node {
    controler: MysensorsControler;
    database: IDbConfigNode;
    handleid: boolean;
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