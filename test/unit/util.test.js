var _ = require('lodash'),
    path = require('path'),
    btoa = require('btoa'),
    expect = require('expect.js'),
    util = require('../../lib/util.js'),

    nodeIt = typeof window === 'undefined' ? it : it.skip;

/* global describe, it */
describe('SDK Utils', function () {
    describe('lodash mixin', function () {
        describe('.inherit', function () {
            it('should correctly handle non function bases', function () {
                var result = util.lodash.inherit({}, null);

                expect(result.super_).to.be(_.noop);
            });
        });

        describe('.args', function () {
            it('should correctly convert an arguments instance to an array equivalent', function () {
                var result = util.lodash.args(arguments, null);

                expect(result).to.eql([]);
            });
        });

        describe('.assignLocked', function () {
            it('should correctly create locked assignments when called', function () {
                var result = util.lodash.assignLocked({}, 'foo', 'bar'),
                    descriptor = Object.getOwnPropertyDescriptor(result, 'foo');

                expect(descriptor).to.eql({
                    value: 'bar',
                    configurable: false,
                    enumerable: false,
                    writable: false
                });
            });
        });

        describe('.randomString', function () {
            it('should use a length of 6 by default', function () {
                expect(util.lodash.randomString()).to.match(/^[A-z0-9]{6}$/);
            });
        });
    });

    describe('.btoa', function () {
        it('should work correctly under regular conditions', function () {
            expect(util.btoa('randomString')).to.be('cmFuZG9tU3RyaW5n');
        });

        (typeof window === 'undefined' ? describe : describe.skip)('special cases', function () {
            var util;

            before(function () {
                global.btoa = btoa;
                delete require.cache[path.resolve('lib/util.js')];
                util = require('../../lib/util');
            });
            after(function () { delete global.btoa; });

            it('should use the provided btoa implementation when applicable', function () {
                expect(util.btoa('randomString')).to.be('cmFuZG9tU3RyaW5n');
            });
        });
    });

    describe('.arrayBufferToString', function () {
        it('should correctly convert array buffers to strings', function () {
            expect(util.arrayBufferToString(new Buffer('random'))).to.be('random');
        });
    });

    describe('.bufferOrArrayBufferToString', function () {
        it('should bail out for non-buffer/string arguments', function () {
            expect(util.bufferOrArrayBufferToString('random')).to.be('random');
        });

        it('should return an empty string for falsy arguments', function () {
            expect(util.bufferOrArrayBufferToString()).to.be('');
        });

        it('should correctly convert array buffers to strings', function () {
            expect(util.bufferOrArrayBufferToString(new Buffer('random'))).to.be('random');
        });

        it('should handle default charsets correctly', function () {
            expect(util.bufferOrArrayBufferToString(new Buffer('random'))).to.be('random');
        });

        it('should handle charset overrides correctly', function () {
            expect(util.bufferOrArrayBufferToString(new Buffer('random'), 'base64')).to.be('cmFuZG9t');
        });

        it('should handle non buffer arguments correctly', function () {
            expect(util.bufferOrArrayBufferToString([])).to.be('');
        });
    });

    describe('.bufferOrArrayBufferToBase64', function () {
        it('should return an empty string for falsy arguments', function () {
            expect(util.bufferOrArrayBufferToBase64()).to.be('');
        });

        nodeIt('should handle strings correctly', function () {
            expect(util.bufferOrArrayBufferToBase64('random')).to.be('cmFuZG9t');
        });

        it('should handle buffers correctly', function () {
            expect(util.bufferOrArrayBufferToBase64(new Buffer('random'))).to.be('cmFuZG9t');
        });

        nodeIt('should handle ArrayBuffers correctly', function () {
            expect(util.bufferOrArrayBufferToBase64(new ArrayBuffer())).to.be('');
        });

        it('should handle non buffer arguments correctly', function () {
            expect(util.bufferOrArrayBufferToBase64([])).to.be('');
        });
    });
});
