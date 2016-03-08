var expect = require('expect.js'),
    Property = require('../../lib/index.js').Property;

/* global describe, it */
describe('Property', function () {
    it('initializes successfully', function () {
        expect((new Property()) instanceof Property).to.be.ok();
    });
    it('allows a description to be set', function () {
        var prop = new Property();
        expect(prop.describe).to.be.a('function');
        expect(prop.describe.bind(prop)).withArgs('Hello Postman').to.not.throwException();
        expect(prop.description).to.be.ok();
        expect(prop.description.toString()).to.be('Hello Postman');
        expect(prop.description.type).to.be('text/plain');
    });
});
