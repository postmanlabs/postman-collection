var expect = require('expect.js'),
    VariableScopeDiff = require('../../').VariableScopeDiff,
    VariableScope = require('../../').VariableScope;

/* global describe, it */
describe('VariableScopeDiff', function () {
    describe('constructor', function () {
        it('should initialize with raw mode by default', function () {
            var diff = new VariableScopeDiff();

            expect(diff).to.have.property('mode', 'raw');
        });

        it('should initialize with raw mode when specified', function () {
            var diff = new VariableScopeDiff({
                mode: 'raw',
                raw: [[1, ['foo'], 'bar']]
            });

            expect(diff).to.have.property('mode', 'raw');
            expect(diff).to.not.have.property('compressed');
            expect(diff).to.have.property('raw');
            expect(diff.raw).to.have.length(1);
        });

        it('should initialize with compressed mode when specified', function () {
            var diff = new VariableScopeDiff({
                mode: 'compressed',
                compressed: {
                    foo: [1, ['foo'], 'bar']
                }
            });

            expect(diff).to.have.property('mode', 'compressed');
            expect(diff).to.have.property('compressed');
            expect(diff).to.not.have.property('raw');
        });
    });

    describe('track', function () {
        it('should track set changesets in raw mode', function () {
            var diff = new VariableScopeDiff({});

            diff.track('set', 'foo', 'value');

            expect(diff).to.have.property('raw');
            expect(diff.raw).to.have.length(1);
            expect(diff.raw[0].toJSON()).to.eql([1, ['foo'], 'value']);
        });

        it('should track set changesets in compressed mode', function () {
            var diff = new VariableScopeDiff({
                mode: 'compressed'
            });

            diff.track('set', 'foo', 'value');

            expect(diff).to.have.property('compressed');
            expect(diff).to.not.have.property('raw');
            expect(diff.compressed).to.have.property('foo');
            expect(diff.compressed.foo.toJSON()).to.eql([1, ['foo'], 'value']);
        });

        it('should compress changesets in compressed mode', function () {
            var diff = new VariableScopeDiff({
                mode: 'compressed'
            });

            diff.track('set', 'foo', 'value');
            diff.track('set', 'foo', 'value1');

            expect(diff).to.have.property('compressed');
            expect(diff).to.not.have.property('raw');
            expect(diff.compressed).to.have.property('foo');
            expect(diff.compressed.foo.toJSON()).to.eql([2, ['foo'], 'value1']);
        });

        it('should track increment ids in changesets', function () {
            var diff = new VariableScopeDiff({});

            diff.track('set', 'foo', 'value');
            diff.track('set', 'bar', 'value1');

            expect(diff).to.have.property('raw');
            expect(diff.raw).to.have.length(2);
            expect(diff.raw[0].toJSON()).to.eql([1, ['foo'], 'value']);
            expect(diff.raw[1].toJSON()).to.eql([2, ['bar'], 'value1']);
        });
    });

    describe('all', function () {
        it('should return all changesets in raw mode', function () {
            var diff = new VariableScopeDiff({
                mode: 'raw',
                raw: [[1, ['foo'], 'fooValue'], [2, ['bar'], 'barValue']]
            });

            expect(diff.all()).to.have.length(2);
        });

        it('should return all changesets in compressed mode', function () {
            var diff = new VariableScopeDiff({
                mode: 'compressed'
            });

            diff.track('set', 'foo', 'fooValue');
            diff.track('set', 'foo', 'fooValue1');
            diff.track('unset', 'bar', 'barValue');

            expect(diff.all()).to.have.length(2);
        });
    });

    describe('apply', function () {
        it('should apply changes in raw mode', function () {
            var diff = new VariableScopeDiff({
                    mode: 'raw',
                    raw: [[1, ['foo'], 'fooValue'], [2, ['bar'], 'barValue']]
                }),
                scope = new VariableScope();

            diff.apply(scope);

            expect(scope.get('foo')).to.eql('fooValue');
            expect(scope.get('bar')).to.eql('barValue');
        });

        it('should apply changes in compressed mode', function () {
            var diff = new VariableScopeDiff({
                    mode: 'compressed'
                }),
                scope = new VariableScope();

            diff.track('set', 'foo', 'fooValue');
            diff.track('set', 'bar', 'barValue');

            diff.apply(scope);

            expect(scope.get('foo')).to.eql('fooValue');
            expect(scope.get('bar')).to.eql('barValue');
        });
    });

    describe('import', function () {
        it('should import raw mode changesets into raw mode', function () {
            var diff1 = new VariableScopeDiff({
                    mode: 'raw'
                }),
                diff2 = new VariableScopeDiff({
                    mode: 'raw'
                });

            diff1.track('set', 'foo', 'fooValue');
            diff1.track('set', 'bar', 'barValue');

            diff2.track('set', 'foo1', 'fooValue');
            diff2.track('set', 'bar1', 'barValue');

            diff1.import(diff2);

            expect(diff1.all()).to.have.length(4);
        });

        it('should import raw mode changesets into compressed mode', function () {
            var diff1 = new VariableScopeDiff({
                    mode: 'compressed'
                }),
                diff2 = new VariableScopeDiff({
                    mode: 'raw'
                });

            diff1.track('set', 'foo', 'fooValue');
            diff1.track('set', 'bar', 'barValue');

            diff2.track('set', 'foo1', 'fooValue');
            diff2.track('set', 'bar1', 'barValue');

            diff1.import(diff2);

            expect(diff1.all()).to.have.length(4);
        });

        it('should import compressed mode changesets into raw mode', function () {
            var diff1 = new VariableScopeDiff({
                    mode: 'raw'
                }),
                diff2 = new VariableScopeDiff({
                    mode: 'compressed'
                });

            diff1.track('set', 'foo', 'fooValue');
            diff1.track('set', 'bar', 'barValue');

            diff2.track('set', 'foo1', 'fooValue');
            diff2.track('set', 'bar1', 'barValue');

            diff1.import(diff2);

            expect(diff1.all()).to.have.length(4);
        });

        it('should import compressed mode changesets into compressed mode', function () {
            var diff1 = new VariableScopeDiff({
                    mode: 'raw'
                }),
                diff2 = new VariableScopeDiff({
                    mode: 'compressed'
                });

            diff1.track('set', 'foo', 'fooValue');
            diff1.track('set', 'bar', 'barValue');

            diff2.track('set', 'foo1', 'fooValue');
            diff2.track('set', 'bar1', 'barValue');

            diff1.import(diff2);

            expect(diff1.all()).to.have.length(4);
        });
    });

    describe('changeset id', function () {
        it('should be generated', function () {
            var diff = new VariableScopeDiff();

            diff.track('set', 'foo', 'bar');

            expect(diff.raw[0]).to.have.property('id', 1);

            diff.track('set', 'bar', 'baz');

            expect(diff.raw[1]).to.have.property('id', 2);
        });

        it('should account for initial state: raw', function () {
            var diff = new VariableScopeDiff({
                mode: 'raw',
                raw: [[5, ['foo'], 'fooValue']]
            });

            diff.track('set', 'foo1', 'bar');

            expect(diff.raw[1]).to.have.property('id', 6);
        });

        it('should account for initial state: compressed', function () {
            var diff = new VariableScopeDiff({
                mode: 'compressed',
                compressed: {
                    foo: [5, ['foo'], 'fooValue'],
                    bar: [10, ['bar'], 'barValue']
                }
            });

            diff.track('set', 'foo1', 'bar');

            expect(diff.compressed.foo1).to.have.property('id', 11);
        });

        it('should adjust after import', function () {
            var diff1 = new VariableScopeDiff({
                    mode: 'compressed',
                    compressed: {
                        foo: [5, ['foo'], 'fooValue']
                    }
                }),
                diff2 = new VariableScopeDiff({
                    mode: 'raw',
                    raw: [[10, ['bar'], 'barValue']]
                });

            diff1.import(diff2);

            diff1.track('set', 'foo1', 'bar');

            expect(diff1.compressed.foo1).to.have.property('id', 11);
        });
    });

    describe('reset', function () {
        it('should reset raw changesets', function () {
            var diff = new VariableScopeDiff({
                mode: 'raw',
                raw: [[5, ['foo'], 'fooValue']]
            });

            diff.reset();

            expect(diff.raw).to.eql([]);
        });

        it('should reset compressed changesets', function () {
            var diff = new VariableScopeDiff({
                mode: 'compressed',
                compressed: {
                    foo: [5, ['foo'], 'fooValue']
                }
            });

            diff.reset();

            expect(diff.compressed).to.eql({});
        });
    });

    describe('compress', function () {
        it('should compress do nothing if already compressed', function () {
            var diff = new VariableScopeDiff({
                mode: 'compressed',
                compressed: {
                    foo: [1, ['foo'], 'fooValue']
                }
            });

            diff.compress();

            expect(diff.compressed.foo.toJSON()).to.eql([1, ['foo'], 'fooValue']);
        });

        it('should compress raw mode changesets', function () {
            var diff = new VariableScopeDiff({
                mode: 'raw',
                raw: [[1, ['foo'], 'fooValue'], [2, ['foo'], 'fooValue1'], [3, ['bar'], 'barValue']]
            });

            diff.compress();

            expect(diff.compressed.foo.toJSON()).to.eql([2, ['foo'], 'fooValue1']);
            expect(diff.compressed.bar.toJSON()).to.eql([3, ['bar'], 'barValue']);
        });
    });
});
