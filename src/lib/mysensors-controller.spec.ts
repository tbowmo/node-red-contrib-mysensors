import { expect } from 'chai';
import { useSinonSandbox } from '../../test/sinon';
import { MysensorsController } from './mysensors-controller';
import { IMysensorsMsg, IStrongMysensorsMsg, MsgOrigin } from './mysensors-msg';
import { mysensor_command, mysensor_internal } from './mysensors-types';

describe('Controller test', () => {
    const sinon = useSinonSandbox();

    function setupTest(timeZone = 'CET') {
        const storage = {
            getFreeNodeId: sinon.stub().resolves(777),
            getChild: sinon.stub().resolves(''),
            getNodeList: sinon.stub().resolves(''),
            child: sinon.stub().resolves(),
            childHeard: sinon.stub(),
            close: sinon.stub(),
            nodeHeard: sinon.stub(),
            setBatteryLevel: sinon.stub(),
            setParent: sinon.stub(),
            sketchName: sinon.stub(),
            sketchVersion: sinon.stub(),
        };

        return {
            storage,
            controller: new MysensorsController(
                storage,
                true,
                true,
                timeZone,
                'M',
                'mys-out',
                false,
            ),
        };
    }

    it('should not respond to an id request if no id can be retrieved', async () => {
        const { controller, storage } = setupTest();
        storage.getFreeNodeId.resolves(undefined);
        const input: IMysensorsMsg = {
            _msgid: '',
            payload: '',
            topic: 'mys-in/255/255/3/0/3',
            origin: MsgOrigin.serial,
        };

        const result = await controller.messageHandler(input);
        
        expect(result).to.equal(undefined);
    });

    it('should respond to a mqtt id request with a new id', async () => {
        const { controller } = setupTest();
        const input: IMysensorsMsg = {
            _msgid: '',
            payload: '',
            topic: 'mys-in/255/255/3/0/3',
        };
        const expected: IMysensorsMsg = {
            _msgid: '',
            payload: '777',
            subType: mysensor_internal.I_ID_RESPONSE,
            topicRoot: 'mys-out',
        };
        const result = await controller.messageHandler(input);
        expect(result).to.include(expected);
    });

    describe('sketch details', () => {
        it('should handle sketch name', async () => {
            const { controller, storage } = setupTest();
            const input: IMysensorsMsg = {
                _msgid: '',
                payload: '123',
                topic: 'mys-in/255/255/3/0/11'
            };

            const result = await controller.messageHandler(input);
            sinon.assert.called(storage.sketchName);
            expect(result).to.equal(undefined);
        });

        it('should handle sketch version', async () => {
            const { controller, storage } = setupTest();
            const input: IMysensorsMsg = {
                _msgid: '',
                payload: '123',
                topic: 'mys-in/255/255/3/0/12'
            };

            const result = await controller.messageHandler(input);
            sinon.assert.called(storage.sketchVersion);
            expect(result).to.equal(undefined);
        });
    });

    it('should handle battery message', async () => {
        const { controller, storage } = setupTest();
        const input: IMysensorsMsg = {
            _msgid: '',
            payload: '123',
            topic: 'mys-in/255/255/3/0/0'
        };

        const result = await controller.messageHandler(input);
        sinon.assert.called(storage.setBatteryLevel);
        expect(result).to.equal(undefined);
    });

    describe('parrent node', () => {

        it('should not set parent node if incorrect debug message is received', async () => {
            const { controller, storage } = setupTest();
            const input: IMysensorsMsg = {
                _msgid: '',
                payload: 'TSF:MSG:WRITE,1-2-3',
                topic: 'mys-in/255/255/3/0/9'
            };

            const result = await controller.messageHandler(input);
            sinon.assert.notCalled(storage.setParent);
            expect(result).to.equal(undefined);
        });

        it('should set parent when correct debug message is received', async () => {
            const { controller, storage } = setupTest();
            const input: IMysensorsMsg = {
                _msgid: '',
                payload: 'TSF:MSG:READ,1-2-3',
                topic: 'mys-in/255/255/3/0/9'
            };

            const result = await controller.messageHandler(input);
            sinon.assert.calledWith(storage.setParent, 1, 2);
            expect(result).to.equal(undefined);
        });
    });

    it('should handle config request from UART message', async () => {
        const { controller } = setupTest();
        const expected: IMysensorsMsg = {
            _msgid: '',
            payload: '255;255;3;0;6;M',
        };
        const request: IMysensorsMsg = {
            payload: '255;255;3;0;6;0',
            _msgid: '',
        };

        const result = await controller.messageHandler(request);
        expect(result).to.include(expected);
    });

    it('should decoded time request CET zone', async () => {
        const { controller } = setupTest();

        sinon.clock.setSystemTime(new Date('2023-01-01 00:00Z'));

        const request: IMysensorsMsg = {
            _msgid: '',
            ack: 0,
            childSensorId: 255,
            messageType: mysensor_command.C_INTERNAL,
            nodeId: 10,
            payload: '',
            subType: mysensor_internal.I_TIME,
        };

        const expected: IStrongMysensorsMsg<mysensor_command.C_INTERNAL> = {
            _msgid: '',
            payload: '1672534800',
            ack: 0,
            childSensorId: 255,
            messageType: mysensor_command.C_INTERNAL,
            nodeId: 10,
            origin: 0,
            subType: mysensor_internal.I_TIME,
        };

        const result = await controller.messageHandler(request);
        expect(result).to.deep.equal(expected);
    });

    it('should decoded time request ZULU zone', async () => {
        const { controller } = setupTest('Z');

        sinon.clock.setSystemTime(new Date('2023-01-01 00:00Z'));

        const request: IMysensorsMsg = {
            _msgid: '',
            ack: 0,
            childSensorId: 255,
            messageType: mysensor_command.C_INTERNAL,
            nodeId: 10,
            payload: '',
            subType: mysensor_internal.I_TIME,
        };

        const expected: IStrongMysensorsMsg<mysensor_command.C_INTERNAL> = {
            _msgid: '',
            payload: '1672531200',
            ack: 0,
            childSensorId: 255,
            messageType: mysensor_command.C_INTERNAL,
            nodeId: 10,
            origin: 0,
            subType: mysensor_internal.I_TIME,
        };

        const result = await controller.messageHandler(request);
        expect(result).to.deep.equal(expected);
    });

    it('should call last heard when message is received', async () => {
        const { controller, storage } = setupTest();

        await controller.messageHandler({
            payload: '10;255;3;0;6;0',
            _msgid: '',
        });
        sinon.assert.called(storage.nodeHeard);
    });

    it('should return undefined without processing if message is not decodable', async () => {
        const { controller, storage } = setupTest();

        const result = await controller.messageHandler({payload: 'no-valid', _msgid: ''});

        expect(result).to.equal(undefined);

        sinon.assert.notCalled(storage.child);
        sinon.assert.notCalled(storage.childHeard);
        sinon.assert.notCalled(storage.getFreeNodeId);
        sinon.assert.notCalled(storage.sketchName);
        sinon.assert.notCalled(storage.sketchVersion);
    });

    it('should handle presentation message', async () => {
        const {controller, storage} = setupTest();

        const testData: IMysensorsMsg = {
            _msgid: '',
            payload: '10;255;0;0;0;100'
        };

        const result = await controller.messageHandler(testData);

        sinon.assert.calledOnce(storage.child);
        expect(result).to.equal(undefined);
    });
});
