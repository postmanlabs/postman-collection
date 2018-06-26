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
                raw: [['1', ['foo'], 'bar']]
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
                    foo: ['1', ['foo'], 'bar']
                }
            });

            expect(diff).to.have.property('mode', 'compressed');
            expect(diff).to.have.property('compressed');
            expect(diff).to.not.have.property('raw');
        });

        it('should initialize with options', function () {
            var diff = new VariableScopeDiff({}, { compress: true });

            expect(diff.isCompressed()).to.eql(true);
        });

        it('should take compression mode from options in case of conflict (prefer compress)', function () {
            var diff = new VariableScopeDiff({
                mode: 'raw',
                raw: [['1', ['foo'], 'bar']]
            }, { compress: true });

            expect(diff.isCompressed()).to.eql(true);
            expect(diff.all()).to.have.length(1);
        });
    });

    describe('track', function () {
        it('should track set changesets in raw mode', function () {
            var diff = new VariableScopeDiff({});

            diff.track('set', 'foo', 'value');

            expect(diff).to.have.property('raw');
            expect(diff.raw).to.have.length(1);
        });

        it('should track set changesets in compressed mode', function () {
            var diff = new VariableScopeDiff({
                mode: 'compressed'
            });

            diff.track('set', 'foo', 'value');

            expect(diff).to.have.property('compressed');
            expect(diff).to.not.have.property('raw');
            expect(diff.compressed).to.have.property('foo');
        });

        it('should compress changesets in compressed mode', function () {
            var diff = new VariableScopeDiff({
                    mode: 'compressed'
                }),
                changeset;

            diff.track('set', 'foo', 'value');
            diff.track('set', 'foo', 'value1');

            expect(diff).to.have.property('compressed');
            expect(diff).to.not.have.property('raw');
            expect(diff.compressed).to.have.property('foo');

            // drop changeset id
            changeset = diff.compressed.foo.toJSON();
            changeset.shift();

            // make sure changeset has the latest value
            expect(changeset).to.eql([['foo'], 'value1']);
        });
    });

    describe('all', function () {
        it('should return all changesets in raw mode', function () {
            var diff = new VariableScopeDiff({
                mode: 'raw',
                raw: [['1', ['foo'], 'fooValue'], ['2', ['bar'], 'barValue']]
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

    describe('count', function () {
        it('should return count in raw mode', function () {
            var diff = new VariableScopeDiff({
                mode: 'raw',
                raw: [['1', ['foo'], 'fooValue'], ['2', ['bar'], 'barValue']]
            });

            expect(diff.count()).to.equal(2);
        });

        it('should return count in compressed mode', function () {
            var diff = new VariableScopeDiff({
                mode: 'compressed'
            });

            diff.track('set', 'foo', 'fooValue');
            diff.track('set', 'foo', 'fooValue1');
            diff.track('unset', 'bar', 'barValue');

            expect(diff.count()).to.equal(2);
        });
    });

    describe('applying', function () {
        it('should apply changes in raw mode', function () {
            var diff = new VariableScopeDiff({
                    mode: 'raw',
                    raw: [[1, ['foo'], 'fooValue'], [2, ['bar'], 'barValue']]
                }),
                scope = new VariableScope();

            diff.applyOn(scope);

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

            diff.applyOn(scope);

            expect(scope.get('foo')).to.eql('fooValue');
            expect(scope.get('bar')).to.eql('barValue');
        });

        it('should bail for anything other than variable scope', function () {
            var diff = new VariableScopeDiff({
                mode: 'compressed'
            });

            // apply on does not return anything, we're okay with that
            // we're just making sure there are no errors
            expect(diff.applyOn({})).to.not.be.ok();
            expect(diff.applyOn()).to.not.be.ok();
            expect(diff.applyOn(null)).to.not.be.ok();
            expect(diff.applyOn(new VariableScopeDiff())).to.not.be.ok();
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

        it('should import changesets from a JSON definition', function () {
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

            diff1.import(diff2.toJSON());

            expect(diff1.all()).to.have.length(4);
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
                    foo: ['1', ['foo'], 'fooValue']
                }
            });

            diff.compress();

            expect(diff.compressed.foo.toJSON()).to.eql(['1', ['foo'], 'fooValue']);
        });

        it('should compress raw mode changesets', function () {
            var diff = new VariableScopeDiff({
                mode: 'raw',
                raw: [['1', ['foo'], 'fooValue'], ['2', ['foo'], 'fooValue1'], ['3', ['bar'], 'barValue']]
            });

            diff.compress();

            expect(diff.compressed.foo.toJSON()).to.eql([2, ['foo'], 'fooValue1']);
            expect(diff.compressed.bar.toJSON()).to.eql([3, ['bar'], 'barValue']);
        });
    });
});
