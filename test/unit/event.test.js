var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Event = require('../../lib/index.js').Event;

/* global describe, it */
describe('Event', function () {
    var rawEvent = fixtures.collectionV2.event[0],
        event = new Event(rawEvent);

    describe('json representation', function () {
        it('must match what the event was initialized with', function () {
            var jsonified = event.toJSON();
            expect(jsonified.listen).to.eql(event.listen);
            // Script property checking is done independently
            expect(jsonified).to.have.property('script');
        });
    });
});
