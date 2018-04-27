import { expect } from 'chai';
import 'mocha';
import { IMysensorsMsg, INodeMessage } from 'node-red-contrib-mysensors/src/lib/mysensors-msg';
import { MysensorsMqtt } from './mysensors-mqtt';

describe('MQTT decode / encode', () => {
    it('Should create correct decoded output when mqtt topic is received', () => {
        const msg: INodeMessage = {
            payload: '6',
            topic: 'mys-in/1/2/3/0/5',
        };
        const expected: IMysensorsMsg = {
            ack: 0,
            childSensorId: 2,
            messageType: 3,
            nodeId: 1,
            payload: '6',
            subType: 5,
            topicRoot: 'mys-in',

        };
        const out = MysensorsMqtt.decode(msg);
        expect(out).to.include(expected);
    });

    it('if not mysensors formatted input return undefined', () => {
        const msg: IMysensorsMsg = {
            payload: '200',
        };
        const out = MysensorsMqtt.decode(msg);
        expect(out).to.eq(undefined);
    });

    it('Encode to mysensors mqtt message', () => {
        const msg: IMysensorsMsg = {
            ack: 0,
            childSensorId: 2,
            messageType: 6,
            nodeId: 1,
            payload: '100',
            subType: 4,
            topicRoot: 'mys-out',
        };
        const out = MysensorsMqtt.encode(msg);
        expect(out).to.include({topic: 'mys-out/1/2/6/0/4', payload: '100'});
    });
});
