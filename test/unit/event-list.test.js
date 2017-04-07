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
});
