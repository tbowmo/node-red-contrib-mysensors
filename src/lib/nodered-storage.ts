/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NodeContextData } from 'node-red';
import {IStorage, INodeData, ISensorData} from './storage-interface';

type Nodes = {
    [key in number]: INodeData
}

export class NoderedStorage implements IStorage {

    constructor(
        private context: NodeContextData | undefined,
        private storageKey: string,
        private store = 'default'
    ) { }

    private async getNodes(): Promise<Nodes> {
        const data = await this.context?.get(this.storageKey, this.store);

        return (data || {}) as Nodes;
    }

    private async setNode(nodeId: number, data: Partial<INodeData>): Promise<void> {
        const nodes = await this.getNodes();
        const node = nodes?.[nodeId] || {
            batteryLevel: -1,
            nodeId: nodeId,
            label: '',
            lastHeard: new Date(),
            lastRestart: new Date(),
            parentId: -1,
            sensors: [],
            sketchName: '',
            sketchVersion: '',
            used: 1,
        };

        nodes[nodeId] = {
            ...node,
            ...data
        };

        return this.context?.set(this.storageKey, nodes, this.store);
    }

    private async setChild(nodeId: number, childId: number, data: Partial<ISensorData>) {
        const children = (await this.getNodes())?.[nodeId]?.sensors;
        if (!children) { // We do not have parent node, so do _not_ try to set any child sensor information
            return;
        }
        const child = children.find((item) => item.childId === childId) || {
            childId,
            description: '',
            lastHeard: new Date(),
            nodeId: nodeId,
            sType: 0,
        };

        const newSensors = children.filter((item) => item.childId !== childId).concat([{
            ...child,
            ...data,
        }]);

        this.setNode(nodeId, {sensors: newSensors});
    }

    public async nodeHeard(nodeId: number): Promise<void> {
        await this.setNode(nodeId, {lastHeard: new Date()});
    }

    public async sketchName(nodeId: number, name: string): Promise<void> {
        await this.setNode(nodeId, { sketchName: name});
    }

    public async sketchVersion(nodeId: number, version: string): Promise<void> {
        await this.setNode(nodeId, {sketchVersion: version});
    }

    public async getNodeList(): Promise<INodeData[]> {
        return Object.values(await this.getNodes()).filter((item) => item.used);
    }

    public async getFreeNodeId(): Promise<number> {
        const freeNode = Object.values(await this.getNodes()).find((item) => !item.used);
        return freeNode?.nodeId || 255;
    }

    public async close(): Promise<void> {
        return;
    }

    public async setParent(nodeId: number, last: number): Promise<void> {
        await this.setNode(nodeId, {parentId: last});
    }

    public async setBatteryLevel(nodeId: number, batterylevel: number): Promise<void> {
        await this.setNode(nodeId, {batteryLevel: batterylevel});
    }


    /** child nodes, dummy implementation for now */
    public async getChild(nodeId: number, childId: number): Promise<ISensorData> {
        const nodes = await this.getNodes();
        return (nodes[nodeId]?.sensors || []).find((item) => item.childId === childId) || {
            childId,
            nodeId,
            description: '',
            lastHeard: new Date(),
            sType: 0
        };
    }

    public async childHeard(nodeId: number, childId: number): Promise<void> {
        return this.setChild(nodeId, childId, {lastHeard:new Date()});
    }

    public async child(_nodeId: number, _childId: number, _type: number, _description: string): Promise<void> {
        await this.setChild(_nodeId, _childId, {sType: _type, description:_description});
    }
}
