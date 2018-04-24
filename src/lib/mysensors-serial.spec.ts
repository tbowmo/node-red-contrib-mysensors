import 'mocha';
import { MysensorsSerial } from './mysensors-serial';
import { expect } from 'chai';
import { MysensorsMsgNull, MysensorsMsg } from 'node-red-contrib-mysensors/src/lib/mysensors-msg';

describe('Serial decode / encode', () => {
    it('Should create correct decoded output when serial is received', () => {
        const msg: MysensorsMsgNull = {
            payload: '1;2;3;0;5;6'
        }
        const expected: MysensorsMsg = {
            nodeId: 1,
            childSensorId: 2,
            messageType: 3,
            ack:0,
            subType: 5,
            payload: "6"

        }
        const out = MysensorsSerial.decode(msg);
        expect(out).to.include(expected);
    })

    it('if not mysensors formatted input return null', () => {
        const msg: MysensorsMsg = {
            payload: "200"
        }
        const out = MysensorsSerial.decode(msg);
        expect(out).to.eq(null);
    })

    it('Encode to mysensors serial message', () => {
        const msg: MysensorsMsg = {
            nodeId: 1,
            childSensorId: 2,
            ack: 0,
            subType: 4,
            messageType: 6,
            payload: "100"
        }
        const out = MysensorsSerial.encode(msg);
        expect(out).to.include({payload: '1;2;6;0;4;100'});
    })
});