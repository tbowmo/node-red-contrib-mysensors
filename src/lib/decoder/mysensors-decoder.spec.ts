import {MysensorsDecoder} from './mysensors-decoder';
import { IStrongMysensorsMsg, MysensorsCommand } from '../mysensors-msg';
import { expect } from 'chai';
import { useSinonSandbox } from '../../../test/sinon';

describe('lib/decoder/mysensors-decoder', () => {
    const sinon = useSinonSandbox();

    class dummy extends MysensorsDecoder {
        public testEnrich(msg: IStrongMysensorsMsg<MysensorsCommand>) {
            return this.enrich(msg);
        }
    }

    it('should descriptions for C_SET message', async () => {
        const decoder = new dummy(false);

        const result = await decoder.testEnrich({
            ack: 0,
            _msgid: '',
            childSensorId: 1,
            messageType: 1,
            nodeId: 1,
            subType: 1,
        });

        expect(result).to.deep.equal({
            _msgid: '',
            ack: 0,
            childSensorId: 1,
            messageType: 1,
            messageTypeStr: 'C_SET',
            nodeId: 1,
            subType: 1,
            subTypeStr: 'V_HUM',
        });
    });

    it('should descriptions for C_REQ message', async () => {
        const decoder = new dummy(false);

        const result = await decoder.testEnrich({
            ack: 0,
            _msgid: '',
            childSensorId: 1,
            messageType: 2,
            nodeId: 1,
            subType: 5,
        });

        expect(result).to.deep.equal({
            _msgid: '',
            ack: 0,
            childSensorId: 1,
            messageType: 2,
            messageTypeStr: 'C_REQ',
            nodeId: 1,
            subType: 5,
            subTypeStr: 'V_FORECAST',
        });
    });

    it('should return descriptions for STREAM message', async() => {
        const decoder = new dummy(false);

        const result = await decoder.testEnrich({
            ack: 0,
            _msgid: '',
            childSensorId: 1,
            messageType: 4,
            nodeId: 1,
            subType: 1,
        });

        expect(result).to.deep.equal({
            _msgid: '',
            ack: 0,
            childSensorId: 1,
            messageType: 4,
            messageTypeStr: 'C_STREAM',
            nodeId: 1,
            subType: 1,
            subTypeStr: 'ST_FIRMWARE_CONFIG_RESPONSE',
        });

    });

    it('should enrich with database lookup', async() => {
        const database = {
            getChild: sinon.stub().resolves({sType: 1}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        const decoder = new dummy(true, database);

        const result = await decoder.testEnrich({
            ack: 0,
            _msgid: '',
            childSensorId: 1,
            messageType: 1,
            nodeId: 1,
            subType: 1,
        });

        expect(result).to.deep.equal({
            _msgid: '',
            ack: 0,
            childSensorId: 1,
            messageType: 1,
            messageTypeStr: 'C_SET',
            nodeId: 1,
            subType: 1,
            subTypeStr: 'V_HUM',
            sensorTypeStr: 'S_MOTION',
        });
    });
});
