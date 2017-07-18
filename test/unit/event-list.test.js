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
});
