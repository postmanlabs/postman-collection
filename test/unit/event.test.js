var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Event = require('../../lib/index.js').Event;

/* global describe, it */
describe('Event', function () {
    describe('global event', function () {
        var rawEvent = fixtures.collectionV2.event[0],
            postmanEvent = new Event(rawEvent);

        it('initializes successfully', function () {
            expect(postmanEvent).to.be.ok();
        });

        describe('has property', function () {
            it('listen', function () {
                expect(postmanEvent).to.have.property('listen', 'test');
            });

            it('script', function () {
                expect(postmanEvent).to.have.property('script');
            });
        });
    });

    describe('inline event', function () {
        var rawEvent = fixtures.collectionV2.event[1],
            postmanEvent = new Event(rawEvent);

        it('initializes successfully', function () {
            expect(postmanEvent).to.be.ok();
        });

        describe('has property', function () {
            it('listen', function () {
                expect(postmanEvent).to.have.property('listen', 'prerequest');
            });

            it('script', function () {
                expect(postmanEvent).to.have.property('script');
                expect(postmanEvent.script).to.be.an('object');

                expect(postmanEvent.script).to.have.property('type', 'text/javascript');

                expect(postmanEvent.script).to.have.property('exec');
                expect(postmanEvent.script.exec).to.be.an('array');
            });
        });
    });
});
