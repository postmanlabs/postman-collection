var expect = require('chai').expect,
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
            expect(EventList.isEventList(new EventList(rawEventList))).to.be.true;
        });

        it('should return false for a raw EventList', function () {
            expect(EventList.isEventList(rawEventList)).to.be.false;
        });

        it('should return false when called without arguments', function () {
            expect(EventList.isEventList()).to.be.false;
        });
    });

    describe('#add', function () {
        it('should correctly handle variadic script formats', function () {
            var eventList = new EventList({}, [{
                    listen: 'test',
                    id: 'my-test-script-1',
                    script: {
                        id: 'test-script-1',
                        type: 'text/javascript',
                        exec: 'console.log("hello");'
                    }
                }]),
                eventListJSON;

            expect(eventList.toJSON()).to.eql([{
                listen: 'test',
                id: 'my-test-script-1',
                script: {
                    id: 'test-script-1',
                    type: 'text/javascript',
                    exec: ['console.log("hello");']
                }
            }]);

            eventList.add({
                listen: 'prerequest',
                script: 'console.log("Nothing to see here, move along...");'
            });

            eventListJSON = eventList.toJSON();

            expect(eventListJSON[0]).to.eql({
                listen: 'test',
                id: 'my-test-script-1',
                script: {
                    id: 'test-script-1',
                    type: 'text/javascript',
                    exec: ['console.log("hello");']
                }
            });

            expect(eventListJSON[1]).to.have.property('listen', 'prerequest');
            expect(eventListJSON[1]).to.have.property('script');
            expect(eventListJSON[1].script).to.have.property('type', 'text/javascript');
            expect(eventListJSON[1].script.exec)
                .to.eql(['console.log("Nothing to see here, move along...");']);
        });
    });

    describe('.listeners', function () {
        var parent,
            item;

        describe('with no parent', function () {
            before(function () {
                item = {};

                item.events = new EventList(item, [{
                    listen: 'test',
                    id: 'my-test-script-1',
                    script: { exec: 'console.log("hello");' }
                }, {
                    listen: 'prerequest',
                    id: 'my-prerequest-script-1',
                    script: { exec: 'console.log("hello again");' }
                }]);
            });

            it('should correctly filter down to the specified type of event listener', function () {
                var listeners = item.events.listeners('test');

                expect(listeners).to.have.lengthOf(1);
                expect(listeners[0]).to.have.property('listen', 'test');
                expect(listeners[0]).to.have.property('id', 'my-test-script-1');
                expect(listeners[0]).to.have.property('script');
            });

            it('should return an empty set for an invalid/missing filter', function () {
                expect(item.events.listeners()).to.have.lengthOf(0);
                expect(item.events.listeners('random')).to.have.lengthOf(0);
            });
        });

        describe('without events on parent', function () {
            before(function () {
                parent = {};
                item = {};

                item.events = new EventList(item, [{
                    listen: 'test',
                    id: 'my-test-script-1',
                    script: { exec: 'console.log("hello");' }
                }, {
                    listen: 'prerequest',
                    id: 'my-prerequest-script-1',
                    script: { exec: 'console.log("hello again");' }
                }]);

                item.__parent = parent;
            });

            it('should correctly filter down to the specified type of event listener', function () {
                var listeners = item.events.listeners('test');

                expect(listeners).to.have.lengthOf(1);
                expect(listeners[0]).to.have.property('listen', 'test');
                expect(listeners[0]).to.have.property('id', 'my-test-script-1');
                expect(listeners[0]).to.have.property('script');
            });
        });

        describe('with events on parent', function () {
            before(function () {
                parent = {};
                item = {};

                item.events = new EventList(item, [{
                    listen: 'test',
                    id: 'my-test-script-1',
                    script: { exec: 'console.log("hello");' }
                }, {
                    listen: 'prerequest',
                    id: 'my-prerequest-script-1',
                    script: { exec: 'console.log("hello again");' }
                }]);

                parent.events = new EventList(parent, [{
                    listen: 'test',
                    id: 'my-parent-level-test-script',
                    script: { exec: 'console.log("hello from up here")' }
                }]);

                item.__parent = parent;
            });

            it('should include events on parent chain', function () {
                var testListeners = item.events.listeners('test'),
                    prScriptListeners = item.events.listeners('prerequest');

                expect(testListeners).to.have.lengthOf(2);

                // order is important
                expect(testListeners[0]).to.have.property('listen', 'test');
                expect(testListeners[0]).to.have.property('id', 'my-parent-level-test-script');
                expect(testListeners[0]).to.have.property('script');

                expect(testListeners[1]).to.have.property('listen', 'test');
                expect(testListeners[1]).to.have.property('id', 'my-test-script-1');
                expect(testListeners[1]).to.have.property('script');


                expect(prScriptListeners).to.have.lengthOf(1);
                expect(prScriptListeners[0]).to.have.property('listen', 'prerequest');
                expect(prScriptListeners[0]).to.have.property('id', 'my-prerequest-script-1');
                expect(prScriptListeners[0]).to.have.property('script');

                // .listeners should not mutate original event list
                expect(item.events.count()).to.equal(2);
                expect(item.__parent.events.count()).to.equal(1);
            });
        });

        describe('with disabled events', function () {
            before(function () {
                parent = {};
                item = {};

                item.events = new EventList(item, [{
                    listen: 'test',
                    id: 'my-test-script-1',
                    disabled: true,
                    script: { exec: 'console.log("hello");' }
                }, {
                    listen: 'prerequest',
                    id: 'my-prerequest-script-1',
                    disabled: true,
                    script: { exec: 'console.log("hello again");' }
                }]);

                parent.events = new EventList(parent, [{
                    listen: 'test',
                    id: 'my-parent-level-test-script',
                    script: { exec: 'console.log("hello from up here")' }
                }]);

                item.__parent = parent;
            });

            it('should exclude disabled events correctly', function () {
                var testListeners = item.events.listeners('test'),
                    prScriptListeners = item.events.listeners('prerequest');

                expect(testListeners).to.have.lengthOf(1);

                expect(testListeners[0]).to.have.property('listen', 'test');
                expect(testListeners[0]).to.have.property('id', 'my-parent-level-test-script');
                expect(testListeners[0]).to.have.property('script');

                expect(prScriptListeners).to.eql([]);
            });
        });
    });

    describe('.listenersOwn', function () {
        var parent,
            item;

        describe('with no parent', function () {
            before(function () {
                item = {};

                item.events = new EventList(item, [{
                    listen: 'test',
                    id: 'my-test-script-1',
                    script: { exec: 'console.log("hello");' }
                }, {
                    listen: 'prerequest',
                    id: 'my-prerequest-script-1',
                    script: { exec: 'console.log("hello again");' }
                }]);
            });

            it('should correctly filter down to the specified type of event listener on the list', function () {
                var testListeners = item.events.listenersOwn('test'),
                    prScriptListeners = item.events.listenersOwn('prerequest');

                expect(testListeners).to.have.lengthOf(1);
                expect(testListeners[0]).to.have.property('listen', 'test');
                expect(testListeners[0]).to.have.property('id', 'my-test-script-1');
                expect(testListeners[0]).to.have.property('script');

                expect(prScriptListeners).to.have.lengthOf(1);
                expect(prScriptListeners[0]).to.have.property('listen', 'prerequest');
                expect(prScriptListeners[0]).to.have.property('id', 'my-prerequest-script-1');
                expect(prScriptListeners[0]).to.have.property('script');
            });

            it('should return an empty set for an invalid/missing filter', function () {
                expect(item.events.listenersOwn()).to.have.lengthOf(0);
                expect(item.events.listenersOwn('random')).to.have.lengthOf(0);
            });
        });

        describe('with events on parent', function () {
            before(function () {
                parent = {};
                item = {};

                item.events = new EventList(item, [{
                    listen: 'test',
                    id: 'my-test-script-1',
                    script: { exec: 'console.log("hello");' }
                }, {
                    listen: 'prerequest',
                    id: 'my-prerequest-script-1',
                    script: { exec: 'console.log("hello again");' }
                }]);

                parent.events = new EventList(parent, [{
                    listen: 'test',
                    id: 'my-parent-level-test-script',
                    script: { exec: 'console.log("hello from up here")' }
                }]);

                item.__parent = parent;
            });

            it('should not include events on parent', function () {
                var testListeners = item.events.listenersOwn('test'),
                    prScriptListeners = item.events.listenersOwn('prerequest');

                expect(testListeners).to.have.lengthOf(1);
                expect(testListeners[0]).to.have.property('listen', 'test');
                expect(testListeners[0]).to.have.property('id', 'my-test-script-1');
                expect(testListeners[0]).to.have.property('script');

                expect(prScriptListeners).to.have.lengthOf(1);
                expect(prScriptListeners[0]).to.have.property('listen', 'prerequest');
                expect(prScriptListeners[0]).to.have.property('id', 'my-prerequest-script-1');
                expect(prScriptListeners[0]).to.have.property('script');
            });
        });

        describe('with disabled listeners', function () {
            before(function () {
                item = {};

                item.events = new EventList(item, [{
                    listen: 'test',
                    id: 'my-test-script-1',
                    disabled: true,
                    script: { exec: 'console.log("hello");' }
                }, {
                    listen: 'test',
                    id: 'my-test-script-2',
                    disabled: false,
                    script: {
                        exec: 'console.log("hello");'
                    }
                }, {
                    listen: 'prerequest',
                    id: 'my-prerequest-script-1',
                    disabled: true,
                    script: { exec: 'console.log("hello again");' }
                }]);
            });

            it('should filter disabled event listeners correctly', function () {
                var testListeners = item.events.listenersOwn('test'),
                    prScriptListeners = item.events.listenersOwn('prerequest');

                expect(testListeners).to.have.lengthOf(1);
                expect(testListeners[0]).to.have.property('listen', 'test');
                expect(testListeners[0]).to.have.property('id', 'my-test-script-2');
                expect(testListeners[0]).to.have.property('script');

                expect(prScriptListeners).to.eql([]);
            });
        });
    });
});
