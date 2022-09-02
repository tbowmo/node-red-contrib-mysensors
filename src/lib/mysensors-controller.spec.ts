import { expect } from 'chai';
import * as sinon from 'sinon';

import { MysensorsController } from './mysensors-controller';
import { IMysensorsMsg } from './mysensors-msg';
import { mysensor_command, mysensor_internal } from './mysensors-types';

describe('Controller test', () => {
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

    const controller = new MysensorsController(
        storage,
        true,
        true,
        'CET',
        'M',
        'mys-out',
    );

    it('MQTT ID Request', async () => {
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

    it('Serial config request', async () => {
        const expected: IMysensorsMsg = {
            _msgid: '',
            payload: '255;255;3;0;6;M',
        };
        const request: IMysensorsMsg = {
            payload: '255;255;3;0;6;0',
            _msgid: '',
        };

        expect(await controller.messageHandler(request)).to.include(expected);
    });

    it('Decoded time request', async () => {
        const request: IMysensorsMsg = {
            _msgid: '',
            ack: 0,
            childSensorId: 255,
            messageType: mysensor_command.C_INTERNAL,
            nodeId: 10,
            payload: '',
            subType: mysensor_internal.I_TIME,
        };

        const expected: IMysensorsMsg = {
            _msgid: '',
            payload: '',
            subType: mysensor_internal.I_TIME,
        };

        expect(await controller.messageHandler(request)).to.include.keys(
            expected,
        );
    });

    it('updates database uppon reception of package', async () => {
        await controller.messageHandler({
            payload: '10;255;3;0;6;0',
            _msgid: '',
        });
        sinon.assert.called(storage.nodeHeard);
    });
});
