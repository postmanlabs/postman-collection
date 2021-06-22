var expect = require('chai').expect,
    MutationTracker = require('../../').MutationTracker;

describe('MutationTracker', function () {
    describe('construction', function () {
        it('should be disabled without definition or options', function () {
            var tracker = new MutationTracker();

            expect(tracker).to.be.ok;
        });

        it('should allow options', function () {
            var tracker = new MutationTracker({ autoCompact: true });

            expect(tracker).to.have.property('autoCompact', true);
        });

        it('should initialize with stream of changes', function () {
            var tracker = new MutationTracker({
                stream: [['foo', 'foo'], ['bar']]
            });

            expect(tracker.count()).to.equal(2);
        });

        it('should initialize with compacted changes', function () {
            var tracker = new MutationTracker({
                compacted: {
                    foo: ['foo', 'foo'],
                    bar: ['bar']
                }
            });

            expect(tracker.count()).to.equal(2);
        });

        it('should initialize with stream and compacted changes', function () {
            var tracker = new MutationTracker({
                stream: [['foo', 'foo']],
                compacted: {
                    bar: ['bar']
                }
            });

            expect(tracker.count()).to.equal(2);
        });

        it('should drop invalid properties in definition', function () {
            var tracker = new MutationTracker({
                autoCompact: 'yay',
                stream: {},
                compacted: []
            });

            expect(tracker).to.deep.include({
                autoCompact: true,
                stream: [],
                compacted: {}
            });
        });
    });

    describe('count', function () {
        it('should give the count', function () {
            var tracker = new MutationTracker({
                stream: [['foo', 'foo']],
                compacted: {
                    bar: ['bar']
                }
            });

            expect(tracker.count()).to.equal(2);
        });

        it('should work when empty', function () {
            var tracker = new MutationTracker();

            expect(tracker.count()).to.equal(0);
        });
    });

    describe('compact', function () {
        it('should compact the active stream of changes', function () {
            var tracker = new MutationTracker({
                stream: [['foo', 'foo'], ['bar']]
            });

            tracker.compact();

            expect(tracker.count()).to.equal(2);
            expect(tracker.compacted).to.include.keys(['foo', 'bar']);
        });

        it('should preserved existing compacted changes', function () {
            var tracker = new MutationTracker({
                stream: [['foo', 'foo'], ['bar']],
                compacted: {
                    baz: ['baz', 'baz']
                }
            });

            tracker.compact();

            expect(tracker.count()).to.equal(3);
            expect(tracker.compacted).to.include.keys(['foo', 'bar', 'baz']);
        });

        it('should handle nested key path', function () {
            var tracker = new MutationTracker({
                stream: [[['foo', 'bar'], '1'], [['foo', 'bar'], '2']]
            });

            tracker.compact();

            expect(tracker.count()).to.equal(1);
            expect(tracker.compacted).to.include.keys(['foo.bar']);
        });
    });

    describe('auto compaction', function () {
        it('should keep the changes compacted', function () {
            var tracker = new MutationTracker({
                autoCompact: true,
                compacted: {
                    baz: ['baz']
                }
            });

            tracker.track('set', 'foo', 'foo');
            tracker.track('unset', 'bar');

            expect(tracker.count()).to.equal(3);
            expect(tracker.stream).to.have.lengthOf(0);
            expect(tracker.compacted).to.include.keys(['foo', 'bar']);
        });
    });

    describe('tracking', function () {
        it('should track set mutations', function () {
            var tracker = new MutationTracker();

            tracker.track('set', 'foo', 'foo');

            expect(tracker.stream).to.eql([['foo', 'foo']]);
        });

        it('should track unset mutations', function () {
            var tracker = new MutationTracker();

            tracker.track('unset', 'foo');

            expect(tracker.stream).to.eql([['foo']]);
        });

        it('should not track anything other than set and unset', function () {
            var tracker = new MutationTracker();

            tracker.track('someFancyMutation', 'foo');

            expect(tracker.count()).to.eql(0);
        });

        it('should not track invalid mutation format', function () {
            var tracker = new MutationTracker();

            // expected signature is two parameters
            tracker.track('set', 'foo', 'bar', 'baz');

            expect(tracker.count()).to.eql(0);
        });

        it('should not track mutation with no instruction', function () {
            var tracker = new MutationTracker();

            tracker.track();
            expect(tracker.count()).to.eql(0);
        });

        it('should not track mutation with invalid instruction as null', function () {
            var tracker = new MutationTracker();

            tracker.track(null);
            expect(tracker.count()).to.eql(0);
        });

        it('should not track mutation with invalid instruction as empty payload', function () {
            var tracker = new MutationTracker();

            tracker.track({});
            expect(tracker.count()).to.eql(0);
        });

        it('should not track mutation with invalid instruction as empty array', function () {
            var tracker = new MutationTracker();

            tracker.track([]);
            expect(tracker.count()).to.eql(0);
        });

        it('should not track mutation with invalid instruction data type', function () {
            var tracker = new MutationTracker();

            tracker.track(1, 2, 3, 4);
            expect(tracker.count()).to.eql(0);
        });

        it('should not track mutation with invalid payload', function () {
            var tracker = new MutationTracker();

            tracker.track('set', 5, 6, 7, 8);
            expect(tracker.count()).to.eql(0);
        });
    });

    describe('apply', function () {
        it('should apply on instances with applyMutation', function () {
            var tracker = new MutationTracker(),
                target = {
                    bar: 'bar',
                    applyMutation: function (instruction, key, value) {
                        if (instruction === 'set') {
                            this[key] = value;

                            return;
                        }

                        delete this[key];
                    }
                };

            tracker.track('set', 'foo', 'foo');
            tracker.track('unset', 'bar');

            tracker.applyOn(target);

            expect(target).to.have.property('foo', 'foo');
            expect(target).to.not.have.property('bar');
        });

        it('should apply in the order of tracked changes', function () {
            var tracker = new MutationTracker(),
                target = {
                    bar: 'bar',
                    applyMutation: function (instruction, key, value) {
                        if (instruction === 'set') {
                            this[key] = value;

                            return;
                        }

                        delete this[key];
                    }
                };

            tracker.track('set', 'foo', 'foo');

            // compact changes till now
            tracker.compact();

            // add more mutations to the same key path
            tracker.track('set', 'foo', 'foo1');
            tracker.track('unset', 'bar');

            tracker.applyOn(target);

            expect(target).to.have.property('foo', 'foo1');
            expect(target).to.not.have.property('bar');
        });

        it('should do nothing on instances without applyMutation', function () {
            var tracker = new MutationTracker(),
                target = {
                    bar: 'bar'
                };

            tracker.track('set', 'foo', 'foo');
            tracker.track('unset', 'bar');

            tracker.applyOn(target);

            expect(target).to.have.property('bar');
        });

        it('should do nothing when called with falsy params', function () {
            var tracker = new MutationTracker(),
                target = {
                    bar: 'bar'
                };

            tracker.track('set', 'foo', 'foo');
            tracker.track('unset', 'bar');

            tracker.applyOn();
            tracker.applyOn(null);
            tracker.applyOn(undefined);
            tracker.applyOn(false);

            expect(target).to.have.property('bar');
        });
    });

    describe('detection', function () {
        it('should detect mutation tracker instances', function () {
            var tracker = new MutationTracker();

            expect(MutationTracker.isMutationTracker(tracker)).to.be.true;
        });

        it('should not detect non mutation tracker instances', function () {
            expect(MutationTracker.isMutationTracker({})).to.be.false;
            expect(MutationTracker.isMutationTracker({ _postman_propertyName: 'MutationTracker' })).to.be.false;
        });
    });
});
