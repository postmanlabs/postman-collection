var expect = require('expect.js'),
    MutationTracker = require('../../').MutationTracker;

/* global describe, it */
describe('MutationTracker', function () {
    describe('construction', function () {
        it('should be disabled without definition or options', function () {
            var tracker = new MutationTracker();

            expect(tracker).to.be.ok();
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
            expect(tracker.compacted).to.have.property('foo');
            expect(tracker.compacted).to.have.property('bar');
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
            expect(tracker.compacted).to.have.property('foo');
            expect(tracker.compacted).to.have.property('bar');
            expect(tracker.compacted).to.have.property('baz');
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
            expect(tracker.stream).to.have.length(0);
            expect(tracker.compacted).to.have.property('foo');
            expect(tracker.compacted).to.have.property('bar');
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
    });

    describe('detection', function () {
        it('should detect mutation tracker instances', function () {
            var tracker = new MutationTracker();

            expect(MutationTracker.isMutationTracker(tracker)).to.equal(true);
        });

        it('should not detect non mutation tracker instances', function () {
            expect(MutationTracker.isMutationTracker({})).to.equal(false);
            expect(MutationTracker.isMutationTracker({ _postman_propertyName: 'MutationTracker' })).to.equal(false);
        });
    });
});
