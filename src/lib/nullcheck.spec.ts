import { expect } from 'chai';
import { NullCheck } from './nullcheck';

describe('lib/nullcheck', () => {
    it('should verify that input is undefined or null', () => {
        expect(NullCheck.isUndefinedOrNull(undefined)).to.equal(true);
        expect(NullCheck.isUndefinedOrNull(null)).to.equal(true);
        expect(NullCheck.isUndefinedOrNull('')).to.equal(false);
        expect(NullCheck.isUndefinedOrNull(0)).to.equal(false);
    });

    it('should verify that input is defined and not null', () => {
        expect(NullCheck.isDefinedOrNonNull(undefined)).to.equal(false);
        expect(NullCheck.isDefinedOrNonNull(null)).to.equal(false);
        expect(NullCheck.isDefinedOrNonNull('')).to.equal(true);
        expect(NullCheck.isDefinedOrNonNull(0)).to.equal(true);
    });

});
