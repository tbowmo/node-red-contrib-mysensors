import { Node, NodeId, NodeProperties } from 'node-red';
import { IDatabase } from '../lib/database.interface';
import { IDecoder } from '../lib/decoder/decoder.interface';
import { MysensorsController } from '../lib/mysensors-controller';
import { MysensorsDebugDecode } from '../lib/mysensors-debug';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import { mysensor_sensor } from '../lib/mysensors-types';

/* Encode */
export interface IEncodeProperties extends NodeProperties {
    mqtt: boolean;
    mqtttopic: string;
}

/* Decode */
export interface IDecodeProperties extends NodeProperties {
    mqtt: boolean;
}
export interface IDecodeEncodeConf extends Node {
    decoder: IDecoder;
}

/* DB */
export interface IDbConfigNode extends Node {
    file?: string;
    database: IDatabase;
}

export interface IDBProperties extends NodeProperties {
    file: string;
}

/* Controller */
export interface IControllerProperties extends NodeProperties {
    database?: NodeId;
    handleid?: boolean;
}

export interface IControllerConfig extends Node {
    controller: MysensorsController;
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
    nodeid: number;
    childid: number;
    subtype: number;
    internal: number;
    ack: boolean;
    msgtype: number;
    presentation: boolean;
    presentationtype: number;
    presentationtext: string;
    fullpresentation: boolean;
    firmwarename: string;
    firmwareversion: string;
}

export interface IDebugConfig extends Node {
    mysDbg: MysensorsDebugDecode;
}
