import 'mocha';
import { MysensorsMqtt } from './mysensors-mqtt';
import { expect } from 'chai';
import { IMysensorsMsg, INodeMessage } from 'node-red-contrib-mysensors/src/lib/mysensors-msg';

describe('MQTT decode / encode', () => {
    it('Should create correct decoded output when mqtt topic is received', () => {
        const msg: INodeMessage = {
            topic: 'mys-in/1/2/3/0/5',
            payload: '6'
        }
        const expected: IMysensorsMsg = {
            nodeId: 1,
            childSensorId: 2,
            messageType: 3,
            ack:0,
            subType: 5,
            payload: '6',
            topicRoot: 'mys-in'

        }
        const out = MysensorsMqtt.decode(msg);
        expect(out).to.include(expected);
    })

    it('if not mysensors formatted input return undefined', () => {
        const msg: IMysensorsMsg = {
            payload: '200'
        }
        const out = MysensorsMqtt.decode(msg);
        expect(out).to.eq(undefined);
    })

    it('Encode to mysensors mqtt message', () => {
        const msg: IMysensorsMsg = {
            nodeId: 1,
            childSensorId: 2,
            ack: 0,
            subType: 4,
            messageType: 6,
            payload: '100',
            topicRoot: 'mys-out'
        }
        const out = MysensorsMqtt.encode(msg);
        expect(out).to.include({topic: 'mys-out/1/2/6/0/4', payload: '100'});
    })
});