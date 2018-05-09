import { mysensor_sensor } from './mysensors-types';

export interface INodeData {
    id: number;
    sketchName: string;
    sketchVersion: string;
    lastHeard: Date;
    parentId: number;
    used: 0|1;
    sensors: ISensorData[];
    lastRestart: Date;
}

export interface ISensorData {
    id: number;
    nodeId: number;
    sType: mysensor_sensor;
}

export interface IDatabase {
    nodeHeard(nodeId: number): Promise<void>;
    sketchName(nodeId: number, name: string): Promise<void>;
    sketchVersion(nodeId: number, version: string): Promise<void>;
    getNodeList(): Promise<INodeData[]>;
    getFreeNodeId(): Promise<number>;
    close(): Promise<void>;
    setParent(node: string, last: string): Promise<void>;
}
