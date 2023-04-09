import { expect } from 'chai';
import {MysensorsDebugDecode} from './mysensors-debug';

describe('lib/mysensors-debug', () => {

    it('should decode basic message', () => {
        const debug = new MysensorsDebugDecode();

        const result = debug.decode('MCO:BGN:INIT CP=(SIGNING)');

        expect(result).to.equal('Core initialization with capabilities (SIGNING)');
    });

    it('should decode command C_REQ', () => {
        const debug = new MysensorsDebugDecode();

        // Fake testvalue, but excercises most of the regex replace methods
        const testValue = 'MCO:BGN:BFR {command:2} {type:1:2}';

        const result = debug.decode(testValue);

        expect(result).to.equal('Callback before() C_REQ V_LIGHT');
    });

    it('should decode command C_SET', () => {
        const debug = new MysensorsDebugDecode();

        // Fake testvalue, but excercises most of the regex replace methods
        const testValue = 'MCO:BGN:BFR {command:1} {type:1:1}';

        const result = debug.decode(testValue);

        expect(result).to.equal('Callback before() C_SET V_HUM');
    });

    it('should decode type C_INTERNAL', () => {
        const debug = new MysensorsDebugDecode();

        // Fake testvalue, but excercises most of the regex replace methods
        const testValue = 'MCO:BGN:BFR {command:3} {pt:2} {type:3:2}';

        const result = debug.decode(testValue);

        expect(result).to.equal('Callback before() C_INTERNAL P_INT16 I_VERSION');
    });

    it('should decode type C_PRESENTATION', () => {
        const debug = new MysensorsDebugDecode();

        // Fake testvalue, but excercises most of the regex replace methods
        const testValue = 'MCO:BGN:BFR {command:0} {pt:2} {type:0:2}';

        const result = debug.decode(testValue);

        expect(result).to.equal('Callback before() C_PRESENTATION P_INT16 S_SMOKE');
    });

    it('should decode type C_STREAM', () => {
        const debug = new MysensorsDebugDecode();

        // Fake testvalue, but excercises most of the regex replace methods
        const testValue = 'MCO:BGN:BFR {command:4} {pt:1} {type:4:2}';

        const result = debug.decode(testValue);

        expect(result).to.equal('Callback before() C_STREAM P_BYTE ST_FIRMWARE_REQUEST');
    });


});
