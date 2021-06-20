var expect = require('chai').expect,
    fixtures = require('../fixtures'),
    sdk = require('../../lib/index.js'),

    Event = sdk.Event,
    Script = sdk.Script;

describe('Event', function () {
    var rawEvent = {
        listen: 'test',
        id: 'my-global-script-1',
        script: {
            type: 'text/javascript',
            exec: 'console.log("hello");'
        }
    };

    describe('sanity', function () {
        describe('global event', function () {
            var rawEvent = fixtures.collectionV2.event[0],
                postmanEvent = new Event(rawEvent);

            it('initializes successfully', function () {
                expect(postmanEvent).to.be.ok;
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
                expect(postmanEvent).to.be.ok;
            });

            describe('has property', function () {
                it('listen', function () {
                    expect(postmanEvent).to.have.property('listen', 'prerequest');
                });

                it('script', function () {
                    expect(postmanEvent).to.have.property('script').that.is.an('object');
                    expect(postmanEvent.script).to.have.property('type', 'text/javascript');
                    expect(postmanEvent.script).to.have.property('exec').that.is.an('array');
                });
            });
        });
    });

    describe('json representation', function () {
        it('must match what the event was initialized with', function () {
            var event = new Event(rawEvent),
                jsonified = event.toJSON();

            expect(jsonified.listen).to.eql(event.listen);
            // Script property checking is done independently
            expect(jsonified).to.have.property('script');
        });
    });

    describe('update', function () {
        var script = 'console.log("This is a test log");';

        it('must work with script instance definitions', function () {
            var event = new Event(rawEvent);

            event.update({ script: new Script({ exec: script }) });
            expect(event.toJSON().script.exec).to.eql([script]);
        });

        it('must work with script strings', function () {
            var event = new Event(rawEvent);

            event.update({ script });
            expect(event.toJSON().script.exec).to.eql([script]);
        });

        it('must work with script arrays', function () {
            var event = new Event(rawEvent);

            event.update({ script: [script] });
            expect(event.toJSON().script.exec).to.eql([script]);
        });

        it('must correctly handle invalid/undefined script input', function () {
            var event = new Event(rawEvent);

            event.update();
            expect(event.toJSON().script.exec).to.eql([rawEvent.script.exec]);
        });

        it('must correctly handle non-compliant script input', function () {
            var event = new Event(rawEvent),
                eventJSON;

            event.update({});

            eventJSON = event.toJSON();

            expect(eventJSON).to.deep.include({
                id: 'my-global-script-1',
                listen: 'test'
            });
            expect(eventJSON).to.have.property('script').that.has.property('id');
            expect(eventJSON.script).to.deep.include({
                type: 'text/javascript',
                exec: ['console.log("hello");']
            });
        });

        it('should update script id', function () {
            var event = new Event(rawEvent),
                beforeJSON = event.toJSON(),
                afterJSON;

            expect(beforeJSON).to.have.property('script').that.has.property('id');
            expect(beforeJSON.script).to.deep.include({
                type: 'text/javascript',
                exec: ['console.log("hello");']
            });

            event.update({ script: { id: 'my-new-script' } });
            afterJSON = event.toJSON();

            expect(beforeJSON.script.id).to.not.equal(afterJSON.script.id);
            expect(afterJSON.script).to.have.property('id', 'my-new-script');
            expect(afterJSON.script.exec).to.be.undefined;
        });
    });
});
