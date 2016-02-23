var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    PropertyList = require('../../lib/index.js').PropertyList,
    Item = require('../../lib/index.js').Item,

    // we use this function to make test result error outputs a bit more easy to read
    extractId = function (item) {
        return item.id;
    };

/* global describe, it, beforeEach, afterEach */
describe('PropertyList', function () {
    it('should look up one single value with the custom key attribute', function () {
        var rawList = fixtures.samplePropertyList,
            FakeType = function (options) {
                this.keyAttr = options.keyAttr;
                this.value = options.value;
            },
            fakeParent = {},
            list,
            testItem = rawList[0];

        list = new PropertyList(FakeType, fakeParent, rawList, { indexBy: 'keyAttr' });

        expect(list.one(testItem.keyAttr).valueOf()).to.eql(rawList[0]);
    });

    describe('reordering method', function () {
        // We create two variables that we would usually deal within these tests to insert and remove stuff
        var enterprise,
            maverick,
            goose,
            stinger;

        beforeEach(function () {
            enterprise = new PropertyList(Item);
            maverick = new Item({ id: 'maverick' });
            goose = new Item({ id: 'goose' });
            stinger = new Item({ id: 'stinger' });
        });

        afterEach(function () {
            enterprise = null;
            maverick = null;
            goose = null,
            stinger = null;
        });

        it('test fixtures must be available', function () {
            expect(enterprise instanceof PropertyList).to.be.ok();
            expect(enterprise.count()).to.be(0);
            expect(maverick instanceof Item).to.be.ok();
            expect(goose instanceof Item).to.be.ok();
            expect(maverick).to.not.be(goose);
            expect(goose).to.not.be(stinger);
            expect(maverick.id).to.be('maverick');
            expect(goose.id).to.be('goose');
            expect(stinger.id).to.be('stinger');
        });

        describe('appends an item', function () {
            it('when list is empty', function () {
                enterprise.append(maverick);
                expect(enterprise.map(extractId)).to.eql(['maverick']);
            });

            it('when list already has one item', function () {
                enterprise.append(maverick);
                enterprise.append(goose);
                expect(enterprise.map(extractId)).to.eql(['maverick', 'goose']);
            });

            it('when list has more than two items', function () {
                enterprise.append(maverick);
                enterprise.append(goose);
                enterprise.append(stinger);
                expect(enterprise.map(extractId)).to.eql(['maverick', 'goose', 'stinger']);
            });

            it('even when the item exists in list', function () {
                enterprise.append(maverick);
                enterprise.append(goose);
                enterprise.append(stinger);

                enterprise.append(goose);
                expect(enterprise.map(extractId)).to.eql(['maverick', 'stinger', 'goose']);
            });
        });

        describe('prepends an item', function () {
            it('when list is empty', function () {
                enterprise.prepend(maverick);
                expect(enterprise.map(extractId)).to.eql(['maverick']);
            });

            it('when list already has one item', function () {
                enterprise.prepend(maverick);
                enterprise.prepend(goose);

                expect(enterprise.map(extractId)).to.eql(['goose', 'maverick']);
            });

            it('when list has more than two items', function () {
                enterprise.prepend(maverick);
                enterprise.prepend(goose);
                enterprise.prepend(stinger);

                expect(enterprise.map(extractId)).to.eql(['stinger', 'goose', 'maverick']);
            });

            it('even when the item exists in list', function () {
                enterprise.prepend(maverick);
                enterprise.prepend(goose);
                enterprise.prepend(stinger);

                enterprise.prepend(goose);
                expect(enterprise.map(extractId)).to.eql(['goose', 'stinger', 'maverick']);
            });
        });

        describe('inserts an item', function () {
            it('in an empty list', function () {
                enterprise.insert(maverick);
                expect(enterprise.map(extractId)).to.eql(['maverick']);
            });

            it('to the end of list when reference `before` is missing', function () {
                enterprise.insert(maverick);
                enterprise.insert(goose);
                expect(enterprise.map(extractId)).to.eql(['maverick', 'goose']);
            });

            it('to the beginning of list when reference `after` is missing', function () {
                enterprise.insert(maverick);
                enterprise.insertAfter(goose);
                expect(enterprise.map(extractId)).to.eql(['goose', 'maverick']);
            });

            it('before a reference item in list', function () {
                enterprise.insert(maverick);
                enterprise.insert(goose);
                enterprise.insert(stinger, goose);
                expect(enterprise.map(extractId)).to.eql(['maverick', 'stinger', 'goose']);
            });

            it('before a reference item id in list', function () {
                enterprise.insert(maverick);
                enterprise.insert(goose);
                enterprise.insert(stinger, 'goose');
                expect(enterprise.map(extractId)).to.eql(['maverick', 'stinger', 'goose']);
            });
        });

        describe('reorders an item', function () {
            it('before a reference item at the beginning of list', function () {
                enterprise.populate([maverick, goose, stinger]);
                enterprise.insert(goose, maverick);

                expect(enterprise.map(extractId)).to.eql(['goose', 'maverick', 'stinger']);
            });

            it('before a reference item at the end of list', function () {
                enterprise.populate([maverick, goose, stinger]);
                enterprise.insert(maverick, stinger);

                expect(enterprise.map(extractId)).to.eql(['goose', 'maverick', 'stinger']);
            });

            it('before a reference item at the middle of list', function () {
                enterprise.populate([maverick, goose, stinger]);
                enterprise.insert(stinger, goose);

                expect(enterprise.map(extractId)).to.eql(['maverick', 'stinger', 'goose']);
            });

            it('after a reference item at the beginning of list', function () {
                enterprise.populate([maverick, goose, stinger]);
                enterprise.insertAfter(stinger, maverick);

                expect(enterprise.map(extractId)).to.eql(['maverick', 'stinger', 'goose']);
            });

            it('after a reference item at the end of list', function () {
                enterprise.populate([maverick, goose, stinger]);
                enterprise.insertAfter(goose, stinger);

                expect(enterprise.map(extractId)).to.eql(['maverick', 'stinger', 'goose']);
            });

            it('after a reference item at the middle of list', function () {
                enterprise.populate([maverick, goose, stinger]);
                enterprise.insertAfter(maverick, goose);

                expect(enterprise.map(extractId)).to.eql(['goose', 'maverick', 'stinger']);
            });
        });
    });
});
