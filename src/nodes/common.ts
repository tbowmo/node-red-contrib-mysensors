import { Node, NodeDef } from 'node-red';

import { IStorage } from '../lib/storage-interface';
import { IDecoder } from '../lib/decoder/decoder-interface';
import { MysensorsController } from '../lib/mysensors-controller';
import { MysensorsDebugDecode } from '../lib/mysensors-debug';
import { IMysensorsMsg } from '../lib/mysensors-msg';
import { mysensor_sensor } from '../lib/mysensors-types';

/* Encode */
export interface IEncodeProperties extends NodeDef {
    mqtt: boolean
    mqtttopic: string
}

/* Decode */
export interface IDecodeProperties extends NodeDef {
    mqtt: boolean
    enrich: boolean
    database?: string
}
export interface IDecodeEncodeConf extends Node {
    decoder: IDecoder
    database?: IDbConfigNode
    enrich: boolean
}

/* DB */
export interface IDbConfigNode extends Node {
    database: IStorage
    contextType: 'flow' | 'global'
    contextKey: {
        store?: string | undefined;
        key: string;
    }
}

export interface IDBProperties extends NodeDef {
    store: string,
    contextType: 'flow' | 'global',
}

/* Controller */
export interface IControllerProperties extends NodeDef {
    database?: string
    handleid?: boolean
    timeresponse?: boolean
    timezone?: string
    measurementsystem?: string
    mqttroot?: string
}

export interface IControllerConfig extends Node {
    controller: MysensorsController
    database: IDbConfigNode
    handleid: boolean
}

/* Encapsulate */
export interface IEncapsulateConfig extends Node {
    sensor: IMysensorsMsg
    presentation: boolean
    presentationtext: string
    presentationtype: mysensor_sensor
    fullpresentation: boolean
    internal: number
    firmwarename: string
    firmwareversion: string
}

export interface IEncapsulateProperties extends NodeDef {
    nodeid: number
    childid: number
    subtype: number
    internal: number
    ack: boolean
    msgtype: number
    presentation: boolean
    presentationtype: number
    presentationtext: string
    fullpresentation: boolean
    firmwarename: string
    firmwareversion: string
}

export interface IDebugConfig extends Node {
    mysDbg: MysensorsDebugDecode
}
