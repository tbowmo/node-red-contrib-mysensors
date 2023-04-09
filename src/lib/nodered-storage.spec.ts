import { expect } from 'chai';
import { NodeContextData } from 'node-red';
import { useSinonSandbox } from '../../test/sinon';
import {NoderedStorage} from './nodered-storage';

describe('lib/nodered-storage', () => {
    const sinon = useSinonSandbox();

    function setupStub(storageKey = 'test-key', store = 'test-store') {
        const get = sinon.stub().named('get');
        const set = sinon.stub().named('set');
        const keys = sinon.stub().named('keys');
        const context: NodeContextData = {
            get,
            set,
            keys,
        };

        return {
            get,
            set,
            keys,
            nodeRedStorage: new NoderedStorage(context, storageKey, store)
        };
    }

    it('should set node heard attribute', async () => {
        const {get, set, nodeRedStorage} = setupStub();

        await nodeRedStorage.nodeHeard(1);

        sinon.assert.calledOnce(get);
        sinon.assert.calledWith(set, 'test-key', {
            '1': {
                batteryLevel: -1,
                nodeId: 1,
                label: '',
                lastHeard: new Date('1970-01-01T00:00:00.000Z'),
                lastRestart: new Date('1970-01-01T00:00:00.000Z'),
                parentId: -1,
                sensors: [],
                sketchName: '',
                sketchVersion: '',
                used: 1
            }
        });
    });

    it('should set sketch name', async () => {
        const {set, nodeRedStorage} = setupStub();

        await nodeRedStorage.sketchName(2, 'test');

        sinon.assert.calledWith(set, 'test-key', {
            '2': {
                batteryLevel: -1,
                nodeId: 2,
                label: '',
                lastHeard: new Date('1970-01-01T00:00:00.000Z'),
                lastRestart: new Date('1970-01-01T00:00:00.000Z'),
                parentId: -1,
                sensors: [],
                sketchName: 'test',
                sketchVersion: '',
                used: 1
            }
        });
    });

    it('should set sketch version', async () => {
        const {get, set, nodeRedStorage} = setupStub();
        get.returns({
            '2': {
                batteryLevel: -1,
                nodeId: 2,
                label: '',
                lastHeard: new Date('1972-01-01T00:00:00.000Z'),
                lastRestart: new Date('1972-01-01T00:00:00.000Z'),
                parentId: -1,
                sensors: [],
                sketchName: 'not-altered',
                sketchVersion: 'not-valid',
                used: 1
            }
        });
        await nodeRedStorage.sketchVersion(2, '1.5');

        sinon.assert.calledWith(set, 'test-key', {
            '2': {
                batteryLevel: -1,
                nodeId: 2,
                label: '',
                lastHeard: new Date('1972-01-01T00:00:00.000Z'),
                lastRestart: new Date('1972-01-01T00:00:00.000Z'),
                parentId: -1,
                sensors: [],
                sketchName: 'not-altered',
                sketchVersion: '1.5',
                used: 1
            }
        });
    });

    it('should set child as heard', async () => {
        const {get, set, nodeRedStorage} = setupStub();
        get.returns({
            '2': {
                batteryLevel: -1,
                nodeId: 2,
                label: '',
                lastHeard: new Date('1972-01-01T00:00:00.000Z'),
                lastRestart: new Date('1972-01-01T00:00:00.000Z'),
                parentId: -1,
                sensors: [
                    {
                        childId: 5,
                        description: 'not-altered',
                        lastHeard: new Date('1969-01-01T00:00:00.000Z'),
                        nodeId: 2,
                        sType: 0,
                    },
                ],
                sketchName: 'not-altered',
                sketchVersion: 'not-valid',
                used: 1
            }
        });
        await nodeRedStorage.childHeard(2, 5);

        sinon.assert.calledWith(set, 'test-key', {
            '2': {
                batteryLevel: -1,
                nodeId: 2,
                label: '',
                lastHeard: new Date('1972-01-01T00:00:00.000Z'),
                lastRestart: new Date('1972-01-01T00:00:00.000Z'),
                parentId: -1,
                sensors: [
                    {
                        childId: 5,
                        description: 'not-altered',
                        lastHeard: new Date('1970-01-01T00:00:00.000Z'),
                        nodeId: 2,
                        sType: 0,
                    },
                ],
                sketchName: 'not-altered',
                sketchVersion: 'not-valid',
                used: 1
            }
        }, 'test-store');
    });

    it('should not set child node if there is no parent', async () => {
        const {get, set, nodeRedStorage} = setupStub();
        get.returns({
            '2': {
                batteryLevel: -1,
                nodeId: 2,
                label: '',
                lastHeard: new Date('1972-01-01T00:00:00.000Z'),
                lastRestart: new Date('1972-01-01T00:00:00.000Z'),
                parentId: -1,
                sensors: [
                    {
                        childId: 5,
                        description: 'not-altered',
                        lastHeard: new Date('1969-01-01T00:00:00.000Z'),
                        nodeId: 2,
                        sType: 0,
                    },
                ],
                sketchName: 'not-altered',
                sketchVersion: 'not-valid',
                used: 1
            }
        });
        await nodeRedStorage.childHeard(3, 5);

        sinon.assert.notCalled(set);
    });

    it('should get list of nodes', async () => {
        const { get, nodeRedStorage } = setupStub();

        get.resolves({
            '1': {
                sketchName: 'heard',
                used: true,
            },
            '2': {
                sketchName: 'unknown',
                used: false,
            }
        });

        const result = await nodeRedStorage.getNodeList();

        expect(result).to.deep.equal([
            {
                sketchName: 'heard',
                used: true,
            }
        ]);
    });

    it('should get a free node id to assign to a new node', async () => {
        const { get, nodeRedStorage } = setupStub();

        get.resolves({
            '1': {
                nodeId: 1,
                sketchName: 'heard',
                used: true,
            },
            '2': {
                nodeId: 2,
                sketchName: 'unknown',
                used: false,
            }
        });

        const result = await nodeRedStorage.getFreeNodeId();

        expect(result).to.equal(2);
    });

    it('should get default child info if none is found', async () => {
        const { get, nodeRedStorage } = setupStub();

        get.resolves({
            '1': {
                nodeId: 1,
                sketchName: 'heard',
                used: true,
                sensors: []
            }
        });

        const result = await nodeRedStorage.getChild(1, 2);

        expect(result).to.deep.equal({
            nodeId: 1,
            childId: 2,
            sType: 0,
            description: '',
            lastHeard: new Date('1970-01-01'),
        });
    });

    it('should get child info from context', async () => {
        const { get, nodeRedStorage } = setupStub();

        get.resolves({
            '1': {
                nodeId: 1,
                sketchName: 'heard',
                used: true,
                sensors: [
                    {
                        childId: 2,
                        nodeId: 1,
                        lastHeard: new Date('1985-01-01'),
                        description: 'known child',
                        sType: 2,
                    }
                ]
            }
        });

        const result = await nodeRedStorage.getChild(1, 2);

        expect(result).to.deep.equal({
            nodeId: 1,
            childId: 2,
            sType: 2,
            description: 'known child',
            lastHeard: new Date('1985-01-01'),
        });
    });

    it('should set child details', async() => {
        const { get, set, nodeRedStorage } = setupStub();

        get.resolves({
            '1': {
                nodeId: 1,
                sketchName: 'heard',
                used: true,
                sensors: [],
            }
        });

        const result = await nodeRedStorage.child(1, 2, 5, 'some description');

        expect(result).to.equal(undefined);
        sinon.assert.calledWith(set, 'test-key', {
            '1': {
                nodeId: 1,
                sketchName: 'heard',
                used: true,
                sensors: [
                    {
                        nodeId: 1,
                        childId: 2,
                        sType: 5,
                        description: 'some description',
                        lastHeard: new Date('1970-01-01'),
                    }
                ],
            }
        }, 'test-store');
    });

    it('should set parent node', async () => {
        const { get, set, nodeRedStorage } = setupStub();

        get.resolves({
            '1': {
                nodeId: 1,
                sketchName: 'heard',
                used: true,
                sensors: [],
            }
        });

        const result = await nodeRedStorage.setParent(1, 2);

        expect(result).to.equal(undefined);
        sinon.assert.calledWith(set, 'test-key', {
            '1': {
                nodeId: 1,
                sketchName: 'heard',
                used: true,
                sensors: [],
                parentId: 2,
            }
        }, 'test-store');
    });

    it('should set batterylevel for node', async () => {
        const { get, set, nodeRedStorage } = setupStub();

        get.resolves({
            '1': {
                nodeId: 1,
                sketchName: 'heard',
                used: true,
                sensors: [],
            }
        });

        const result = await nodeRedStorage.setBatteryLevel(1, 2);

        expect(result).to.equal(undefined);
        sinon.assert.calledWith(set, 'test-key', {
            '1': {
                nodeId: 1,
                sketchName: 'heard',
                used: true,
                sensors: [],
                batteryLevel: 2,
            }
        }, 'test-store');
    });

    it('should handle undefined context gracefully', async () => {
        const nodeRedStorage = new NoderedStorage(undefined, '');

        const result = await nodeRedStorage.setBatteryLevel(1, 2);

        expect(result).to.equal(undefined);
    });
});
