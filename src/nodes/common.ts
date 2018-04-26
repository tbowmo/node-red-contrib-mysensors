import { Node, NodeProperties, NodeId } from 'node-red';
import { MysensorsController } from '../lib/mysensors-controller';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import { mysensor_sensor } from '../lib/mysensors-types';
import { Database } from '../lib/database';

/* Encode */
export interface IEncodeProperties extends NodeProperties {
    mqtt: boolean,
    mqtttopic: string
}

/* Decode */
export interface IDecodeProperties extends NodeProperties {
    mqtt: boolean;
}

/* DB */ 
export interface IDbConfigNode extends Node {
    file?: string;
    database: Database
}

export interface IDBProperties extends NodeProperties {
    file: string;
}

/* Controler */
export interface IControlerProperties extends NodeProperties {
    database?: NodeId;
    handleid?: boolean;
}

export interface IControlerConfig extends Node {
    controler: MysensorsController;
    database: IDbConfigNode;
    handleid: boolean;
}

/* Encapsulate */
export interface IEncapsulateConfig extends Node {
    sensor: IMysensorsMsg;
    presentation: boolean;
    presentationtext: string;
    presentationtype: mysensor_sensor;
    fullpresentation: boolean;
    internal: number;
    firmwarename: string;
    firmwareversion: string;

}

export interface IEncapsulateProperties extends NodeProperties {
    nodeid: number,
    childid: number,
    subtype: number,
    internal: number, 
    ack : boolean,
    msgtype: number,
    presentation: boolean,
    presentationtype: number,
    presentationtext: string,
    fullpresentation: boolean,
    firmwarename : string,
    firmwareversion : string
}