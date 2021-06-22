var _ = require('lodash'),
    expect = require('chai').expect,
    sdk = require('../../lib/index.js'),

    fixtures = require('../fixtures');

describe('PropertyBase', function () {
    describe('meta properties', function () {
        it('should return all the meta properties', function () {
            var definition = {
                    _postman_one: { a: 'b' },
                    _postman_two: 'something',
                    _three: _.noop
                },
                base = new sdk.PropertyBase(definition);

            expect(base.meta()).to.deep.include({
                postman_one: definition._postman_one,
                postman_two: definition._postman_two,
                three: definition._three
            });
        });

        it('should pick given meta properties', function () {
            var definition = {
                    _postman_one: { a: 'b' },
                    _postman_two: 'something',
                    _three: _.noop
                },
                base = new sdk.PropertyBase(definition);

            expect(base.meta('postman_one').postman_one).to.eql(definition._postman_one);
            expect(base.meta('postman_one')).to.not.have.property('postman_two');
            expect(base.meta('postman_one')).to.not.have.property('three');
        });

        it('should be a part of toJSON', function () {
            var definition = {
                    _postman_one: { a: 'b' },
                    _postman_two: 'something',
                    _three: _.noop
                },
                base = new sdk.PropertyBase(definition);

            expect(base).to.have.property('_');
            expect(base._).to.include.keys(['postman_one', 'postman_two']);
        });
    });

    describe('.forEachParent()', function () {
        var collection = new sdk.Collection(fixtures.nestedCollectionV2),
            item = collection.items.members[1].items.members[0].items.members[0];

        it('should set default options correctly when none are specified', function () {
            var chain = [],
                expectedOrder = ['F2', 'F2.F3'];

            item.forEachParent(chain.unshift.bind(chain));
            expect(_.map(chain, 'name')).to.eql(expectedOrder);
        });

        it('should return the collection as well when required', function () {
            var chain = [],
                expectedOrder = ['multi-level-folders-v2', 'F2', 'F2.F3'];

            item.forEachParent({ withRoot: true }, chain.unshift.bind(chain));
            expect(_.map(chain, 'name')).to.eql(expectedOrder);
        });

        it('should not blow up for invalid arguments', function () {
            expect(function () {
                item.forEachParent.bind(item)({ withRoot: true }, 'random');
            }).to.not.throw();
        });
    });

    describe('parent lookups', function () {
        var util = require('../../lib/util'),
            FakeType,
            // See below for why these are named this way ;-)
            gggp,
            ggp,
            gp,
            p,
            c;

        FakeType = function (level, value) {
            FakeType.super_.apply(this, arguments);
            this.level = level;
            this.value = value;
        };

        util.lodash.inherit(FakeType, sdk.PropertyBase);

        beforeEach(function () {
            gggp = new FakeType('great-great-grandparent');
            ggp = new FakeType('great-grandparent', 'yo1');
            gp = new FakeType('grandparent');
            p = new FakeType('parent', 'yo2');
            c = new FakeType('child');

            c.__parent = p;
            p.__parent = gp;
            gp.__parent = ggp;
            ggp.__parent = gggp;
        });

        afterEach(function () {
            gggp = null;
            ggp = null;
            gp = null;
            p = null;
            c = null;
        });

        describe('.findInParents()', function () {
            it('should be able to look up values from the parent', function () {
                expect(c.findInParents('value')).to.eql('yo2');
            });

            it('should be able retrieve the value if stored locally', function () {
                expect(p.findInParents('value')).to.eql('yo2');
            });

            it('should return undefined if no value was found', function () {
                expect(gggp.findInParents('value')).to.be.undefined;
            });

            it('should return undefined if a random property is provided for lookup', function () {
                expect(c.findInParents('some-randome-stuff')).to.be.undefined;
            });

            describe('with customizer', function () {
                it('should be able to lookup with a customizer', function () {
                    var customizer = function (parent) { return parent.value === 'yo1'; };

                    expect(c.findInParents('value', customizer)).to.equal('yo1');
                });

                it('should prioritize customizer over existance', function () {
                    var i = 0,
                        // find parent 4 levels up
                        customizer = function () { return ++i >= 4; };

                    expect(c.findInParents('value', customizer)).to.equal('yo1');
                });

                it('should return undefined if a random property is provided for lookup', function () {
                    var customizer = function () { return false; };

                    expect(c.findInParents('some-randome-stuff', customizer)).to.be.undefined;
                });
            });
        });

        describe('.findParentContaining()', function () {
            it('should be able to look up owner when it is the parent', function () {
                expect(c.findParentContaining('value')).to.equal(p);
            });

            it('should be able retrieve the owner when property exists locally', function () {
                expect(p.findParentContaining('value')).to.equal(p);
            });

            it('should return undefined if no value was found', function () {
                expect(gggp.findParentContaining('value')).to.be.undefined;
            });

            it('should return undefined if a random property is provided for lookup', function () {
                expect(c.findParentContaining('some-randome-stuff')).to.be.undefined;
            });

            describe('with customizer', function () {
                it('should be able to lookup with a customizer', function () {
                    var customizer = function (parent) { return parent.value === 'yo1'; };

                    expect(c.findParentContaining('value', customizer)).to.equal(ggp);
                });

                it('should prioritize customizer over existance', function () {
                    var i = 0,
                        // find parent 4 levels up
                        customizer = function () { return ++i >= 4; };

                    expect(c.findParentContaining('value', customizer)).to.equal(ggp);
                });

                it('should return undefined if a random property is provided for lookup', function () {
                    var customizer = function () { return false; };

                    expect(c.findParentContaining('some-randome-stuff', customizer)).to.be.undefined;
                });
            });
        });
    });

    describe('.setParent()', function () {
        var parent = { foo: 'bar' };

        it('should set a provided parent correctly', function () {
            var base = new sdk.PropertyBase();

            base.setParent(parent);

            expect(base.__parent).to.eql(parent);
            expect(Object.getOwnPropertyDescriptor(base, '__parent')).to.eql({
                value: parent,
                writable: true,
                enumerable: false,
                configurable: true
            });
        });

        it('should overwrite existing parents', function () {
            var newParent = { alpha: 'beta' },
                base = new sdk.PropertyBase();

            base.setParent(parent);

            base.setParent(newParent);
            expect(base.__parent).to.eql(newParent);
        });
    });

    describe('.parent()', function () {
        it('should return grandparent by default', function () {
            var base = new sdk.PropertyBase();

            base.__parent = {
                p: true
            };

            base.__parent.__parent = {
                g: true
            };

            expect(base.parent()).to.eql({
                g: true
            });
        });

        it('should return parent if grandparent is missing', function () {
            var base = new sdk.PropertyBase();

            base.__parent = {
                p: true
            };
            expect(base.parent()).to.eql({
                p: true
            });
        });
    });
});
