import { expect } from 'chai';
import 'mocha';
import { IMysensorsMsg, INodeMessage } from '../mysensors-msg';
import { MysensorsMqtt } from './mysensors-mqtt';

describe('MQTT decode / encode', () => {
    let decode: MysensorsMqtt;

    beforeEach(() => {
        decode = new MysensorsMqtt();
    });

    it('Should create correct decoded output when mqtt topic is received', async () => {
        const msg: INodeMessage = {
            _msgid: '',
            payload: '6',
            topic: 'mys-in/1/2/3/0/5',
        };
        const expected: IMysensorsMsg = {
            _msgid: '',
            ack: 0,
            childSensorId: 2,
            messageType: 3,
            nodeId: 1,
            payload: '6',
            subType: 5,
            topicRoot: 'mys-in',

        };
        const out = await decode.decode(msg);
        expect(out).to.include(expected);
    });

    it('if not mysensors formatted input return undefined', async () => {
        const msg: INodeMessage = {
            _msgid: '',
            payload: '200',
        };
        const out = await decode.decode(msg);
        expect(out).to.eq(undefined);
    });

    it('Encode to mysensors mqtt message', () => {
        const msg: IMysensorsMsg = {
            _msgid: '',
            ack: 0,
            childSensorId: 2,
            messageType: 6,
            nodeId: 1,
            payload: '100',
            subType: 4,
            topicRoot: 'mys-out',
        };
        const out = decode.encode(msg);
        expect(out).to.include({topic: 'mys-out/1/2/6/0/4', payload: '100'});
    });
});
