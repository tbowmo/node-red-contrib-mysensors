import { mysensor_sensor } from './mysensors-types'

export type INodeData = {
    nodeId: number
    label: string
    sketchName: string
    sketchVersion: string
    lastHeard: Date
    parentId: number
    used: boolean
    sensors: ISensorData[]
    lastRestart: Date
    batteryLevel: number
}

export type ISensorData = {
    nodeId: number
    childId: number
    description: string
    sType: mysensor_sensor
    lastHeard: Date
}

export interface IStorage {
    nodeHeard(nodeId: number): Promise<void>
    sketchName(nodeId: number, name: string): Promise<void>
    sketchVersion(nodeId: number, version: string): Promise<void>
    getNodeList(): Promise<INodeData[] | undefined>
    getFreeNodeId(): Promise<number | undefined>
    setParent(nodeId: number, last: number): Promise<void>
    child(
        nodeId: number,
        childId: number,
        type: number,
        description: string,
    ): Promise<void>
    childHeard(nodeId: number, childId: number): Promise<void>
    getChild(nodeId: number, childId: number): Promise<ISensorData | undefined>
    setBatteryLevel(nodeId: number, batterylevel: number): Promise<void>
}
