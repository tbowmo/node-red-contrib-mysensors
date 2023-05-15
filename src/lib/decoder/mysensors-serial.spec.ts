import { expect } from 'chai';
import 'mocha';
import { IMysensorsMsg, INodeMessage, IStrongMysensorsMsg } from '../mysensors-msg';
import { mysensor_command } from '../mysensors-types';
import { MysensorsSerial } from './mysensors-serial';

describe('Serial decode / encode', () => {
    let decode: MysensorsSerial;

    beforeEach(() => {
        decode = new MysensorsSerial();
    });

    it('Should create correct decoded output when serial is received', async () => {
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
        const out = await decode.decode(msg);
        expect(out).to.include(expected);
    });

    it('if not mysensors formatted input return undefined', async () => {
        const msg: INodeMessage = {
            _msgid: 'id',
            payload: '200',
        };
        const out = await decode.decode(msg);
        expect(out).to.eq(undefined);
    });

    it('Encode to mysensors serial message', () => {
        const msg: IStrongMysensorsMsg<mysensor_command.C_REQ> = {
            _msgid: 'id',
            ack: 0,
            childSensorId: 2,
            messageType: mysensor_command.C_REQ,
            nodeId: 1,
            payload: '100',
            subType: 4,
        };
        const out = decode.encode(msg);
        expect(out).to.include({payload: '1;2;2;0;4;100'});
    });
});
