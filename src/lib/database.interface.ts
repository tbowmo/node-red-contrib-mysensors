import { mysensor_sensor } from './mysensors-types';

export interface INodeData {
    nodeId: number;
    label: string;
    sketchName: string;
    sketchVersion: string;
    lastHeard: Date;
    parentId: number;
    used: 0|1;
    sensors: ISensorData[];
    lastRestart: Date;
    batteryLevel: number;
}

export interface ISensorData {
    nodeId: number;
    childId: number;
    description: string;
    sType: mysensor_sensor;
    lastHeard: Date;
}

export interface IDatabase {
    nodeHeard(nodeId: number): Promise<void>;
    sketchName(nodeId: number, name: string): Promise<void>;
    sketchVersion(nodeId: number, version: string): Promise<void>;
    getNodeList(): Promise<INodeData[]>;
    getFreeNodeId(): Promise<number>;
    close(): Promise<void>;
    setParent(node: string, last: string): Promise<void>;
    child(nodeId: number, childId: number, type: number, description: string): Promise<void>;
    childHeard(nodeId: number, childId: number): Promise<void>;
    getChild(nodeId: number, childId: number): Promise<ISensorData>;
    setBatteryLevel(nodeId: number, batterylevel: number): Promise<void>;
}
