import { expect } from 'chai';
import 'mocha';
import { IMysensorsMsg, INodeMessage } from '../mysensors-msg';
import { MysensorsSerial } from './mysensors-serial';

describe('Serial decode / encode', () => {
    let decode: MysensorsSerial;
    beforeEach(() => {
        decode = new MysensorsSerial();
    });
    it('Should create correct decoded output when serial is received', () => {
        const msg: INodeMessage = {
            _msgid: 'id',
            payload: '1;2;3;0;5;6',
        };

        const expected: IMysensorsMsg = {
            _msgid: 'id',
            ack: 0,
            childSensorId: 2,
            messageType: 3,
            nodeId: 1,
            payload: '6',
            subType: 5,
        };
        const out = decode.decode(msg);
        expect(out).to.include(expected);
    });

    it('if not mysensors formatted input return undefined', () => {
        const msg: INodeMessage = {
            _msgid: 'id',
            payload: '200',
        };
        const out = decode.decode(msg);
        expect(out).to.eq(undefined);
    });

    it('Encode to mysensors serial message', () => {
        const msg: IMysensorsMsg = {
            _msgid: 'id',
            ack: 0,
            childSensorId: 2,
            messageType: 6,
            nodeId: 1,
            payload: '100',
            subType: 4,
        };
        const out = decode.encode(msg);
        expect(out).to.include({payload: '1;2;6;0;4;100'});
    });
});
