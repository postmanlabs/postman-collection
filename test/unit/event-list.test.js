var expect = require('expect.js'),
    sdk = require('../../lib/index.js'),

    EventList = sdk.EventList;

describe('EventList', function () {
    describe('isEventList', function () {
        var rawEventList = [{
            listen: 'test',
            id: 'my-global-script-1',
            script: {
                type: 'text/javascript',
                exec: 'console.log("hello");'
            }
        }];

        it('should return true for a valid EventList instance', function () {
            expect(EventList.isEventList(new EventList(rawEventList))).to.be(true);
        });

        it('should return false for a raw EventList', function () {
            expect(EventList.isEventList(rawEventList)).to.be(false);
        });

        it('should return false when called without arguments', function () {
            expect(EventList.isEventList()).to.be(false);
        });
    });

    describe('#add', function () {
        it('should correctly handle variadic script formats', function () {
            var eventList = new EventList({}, [{
                listen: 'test',
                id: 'my-test-script-1',
                script: {
                    type: 'text/javascript',
                    exec: 'console.log("hello");'
                }
            }]);

            expect(eventList.toJSON()).to.eql([{
                listen: 'test',
                id: 'my-test-script-1',
                script: {
                    type: 'text/javascript',
                    exec: ['console.log("hello");']
                }
            }]);

            eventList.add({
                listen: 'prerequest',
                script: 'console.log("Nothing to see here, move along...");'
            });

            expect(eventList.toJSON()).to.eql([{
                listen: 'test',
                id: 'my-test-script-1',
                script: {
                    type: 'text/javascript',
                    exec: ['console.log("hello");']
                }
            }, {
                listen: 'prerequest',
                script: {
                    type: 'text/javascript',
                    exec: ['console.log("Nothing to see here, move along...");']
                }
            }]);
        });
    });

    describe('.listeners', function () {
        var el = new EventList({}, [{
            listen: 'test',
            id: 'my-test-script-1',
            script: { exec: 'console.log("hello");' }
        }, {
            listen: 'prerequest',
            id: 'my-prerequest-script-1',
            script: { exec: 'console.log("hello again");' }
        }]);

        it('should correctly filter down to the specified type of event listener', function () {
            var listeners = el.listeners('test');

            expect(listeners).to.have.length(1);
            expect(listeners[0]).to.have.property('listen', 'test');
            expect(listeners[0]).to.have.property('id', 'my-test-script-1');
            expect(listeners[0]).to.have.property('script');
        });

        it('should return an empty set for an invalid/missing filter', function () {
            expect(el.listeners()).to.have.length(0);
            expect(el.listeners('random')).to.have.length(0);
        });
    });

    describe('.listenersOwn', function () {
        var el = new EventList({}, [{
            listen: 'test',
            id: 'my-test-script-1',
            script: {
                type: 'text/javascript',
                exec: 'console.log("hello");'
            }
        }, {
            listen: 'prerequest',
            id: 'my-prerequest-script-1',
            script: {
                type: 'text/javascript',
                exec: 'console.log("hello again");'
            }
        }]);

        it('should correctly filter down to the specified type of event listener', function () {
            var listeners = el.listenersOwn('test');
            expect(listeners).to.have.length(1);
            expect(listeners[0]).to.have.property('listen', 'test');
            expect(listeners[0]).to.have.property('id', 'my-test-script-1');
            expect(listeners[0]).to.have.property('script');
        });

        it('should return an empty set for an invalid/missing filter', function () {
            expect(el.listenersOwn()).to.have.length(0);
            expect(el.listenersOwn('random')).to.have.length(0);
        });
    });
});
