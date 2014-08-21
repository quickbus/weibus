'use strict';
var expect = require('chai').expect;

describe('PhoneReg', function() {

  it('should match phonenumbers ', function(done) {
    var phoneReg = /^[0-9]{11}$/;

    expect(phoneReg.test('notnumber')).to.be.not.ok;
    expect(phoneReg.test('1313')).to.be.not.ok;
    expect(phoneReg.test('13606601625')).to.be.ok;

    done();
  });

});
