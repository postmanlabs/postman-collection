var _ = require('lodash'),
    expect = require('expect.js'),
    PropertyList = require('../../lib/index.js').PropertyList,
    Item = require('../../lib/index.js').Item,

    // we use this function to make test result error outputs a bit more easy to read
    extractId = function (item) {
        return item.id;
    };

/* global describe, it, beforeEach, afterEach */
describe('PropertyList', function () {
    it('should look up one single value with the custom key attribute', function () {
        var FakeType,
            list;

        FakeType = function (options) {
            this.id = options.id;
            this.keyAttr = options.keyAttr;
            this.value = options.value;
        };

        FakeType._postman_propertyIndexKey = 'keyAttr';

        list = new PropertyList(FakeType, {}, {
            id: 'woahwoah',
            keyAttr: 'yoLoLo',
            value: 'what'
        });

        expect(list.one('woahwoah')).to.not.be.ok();
        expect(list.one('Yololo')).to.not.be.ok(); // cross check lowercase lookup to fail
        expect(list.one('yoLoLo').valueOf()).to.eql({
            id: 'woahwoah',
            keyAttr: 'yoLoLo',
            value: 'what'
        });
    });

    it('should do a case insensitive lookup when set in type', function () {
        var FakeType,
            list;

        FakeType = function (options) {
            this.keyAttr = options.keyAttr;
            this.value = options.value;
        };

        FakeType._postman_propertyIndexKey = 'keyAttr';
        FakeType._postman_propertyIndexCaseInsensitive = true;

        list = new PropertyList(FakeType, {}, {
            keyAttr: 'yoLoLo',
            value: 'what'
        });

        expect(list.one('yOlOlO').valueOf()).to.eql({
            keyAttr: 'yoLoLo',
            value: 'what'
        });
        expect(list.one('Yololo').valueOf()).to.eql({
            keyAttr: 'yoLoLo',
            value: 'what'
        });
    });

    it('should remove an item using id lookup', function () {
        var FakeType,
            list;

        FakeType = function (options) {
            this.keyAttr = options.keyAttr;
            this.value = options.value;
        };

        FakeType._postman_propertyIndexKey = 'keyAttr';
        // FakeType._postman_propertyIndexCaseInsensitive = false; // default is this

        list = new PropertyList(FakeType, {}, {
            keyAttr: 'yoLoLo',
            value: 'what'
        });

        expect(list.count()).to.be(1);
        list.remove('Yololo'); // remove using different case. it should not work
        expect(list.count()).to.be(1);
        expect(Object.keys(list.reference)).to.eql(['yoLoLo']);

        list.remove('yoLoLo');
        expect(list.count()).to.be(0);
        expect(Object.keys(list.reference)).to.eql([]);
    });

    it('should remove an item using case insensitive lookup', function () {
        var FakeType,
            list;

        FakeType = function (options) {
            this.keyAttr = options.keyAttr;
            this.value = options.value;
        };

        FakeType._postman_propertyIndexKey = 'keyAttr';
        FakeType._postman_propertyIndexCaseInsensitive = true;

        list = new PropertyList(FakeType, {}, {
            keyAttr: 'yoLoLo',
            value: 'what'
        });

        expect(list.count()).to.be(1);
        expect(Object.keys(list.reference)).to.eql(['yololo']);
        list.remove('Yololo');
        expect(list.count()).to.be(0);
        expect(Object.keys(list.reference)).to.eql([]);
    });

    it('should remove an item using a lookup function', function () {
        var FakeType,
            list;

        FakeType = function (options) {
            this.keyAttr = options.keyAttr;
            this.value = options.value;
        };

        FakeType._postman_propertyIndexKey = 'keyAttr';
        // FakeType._postman_propertyIndexCaseInsensitive = false; // this is default

        list = new PropertyList(FakeType, {}, [{
            keyAttr: 'yoLoLo1',
            value: 'what'
        }, {
            keyAttr: 'yoLoLo2',
            value: 'where'
        }]);

        expect(list.count()).to.be(2);
        list.remove(function (item) {
            return (item.keyAttr === 'yoLoLo1');
        });

        expect(list.count()).to.be(1);
        expect(Object.keys(list.reference)).to.eql(['yoLoLo2']);
    });

    it('should remove all items correctly', function () {
        var FakeType,
            list;

        FakeType = function (options) {
            this.keyAttr = options.keyAttr;
            this.value = options.value;
        };

        FakeType._postman_propertyIndexKey = 'keyAttr';
        // FakeType._postman_propertyIndexCaseInsensitive = false; // this is default

        list = new PropertyList(FakeType, {}, [{
            keyAttr: 'yoLoLo1',
            value: 'what'
        }, {
            keyAttr: 'yoLoLo2',
            value: 'where'
        }]);

        list.clear();

        expect(list.count()).to.be(0);
    });

    it('should repopulate a list', function () {
        var FakeType,
            list;

        FakeType = function (options) {
            this.keyAttr = options.keyAttr;
            this.value = options.value;
        };

        FakeType._postman_propertyIndexKey = 'keyAttr';
        // FakeType._postman_propertyIndexCaseInsensitive = false; // this is default

        list = new PropertyList(FakeType, {}, [{
            keyAttr: 'yoLoLo1',
            value: 'what'
        }, {
            keyAttr: 'yoLoLo2',
            value: 'where'
        }]);

        list.repopulate([{
            keyAttr: 'yoLoLo3',
            value: 'what'
        }, {
            keyAttr: 'yoLoLo4',
            value: 'where'
        }]);

        expect(list.count()).to.be(2);

        expect(list.map('keyAttr')).to.eql(['yoLoLo3', 'yoLoLo4']);
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
            goose = null;
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

        describe('finds an item', function () {
            it('when list has more than two items', function () {
                enterprise.append(maverick);
                enterprise.append(goose);
                enterprise.append(stinger);
                expect(enterprise.find({ id: 'goose' })).to.eql(goose);
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

    describe('items allowing multiple values', function () {
        it('should hold multiple items with the same key as an array', function () {
            var FakeType,
                list;

            FakeType = function (options) {
                this.keyAttr = options.keyAttr;
                this.value = options.value;
            };

            FakeType._postman_propertyIndexKey = 'keyAttr';
            FakeType._postman_propertyAllowsMultipleValues = true;

            list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }, {
                keyAttr: 'key2',
                value: 'val3'
            }]);

            expect(Object.keys(list.reference)).to.eql(['key1', 'key2']);

            expect(list.reference.key1).to.eql([
                { keyAttr: 'key1', value: 'val1' },
                { keyAttr: 'key1', value: 'val2' }
            ]);

            expect(list.reference.key2).to.eql({ keyAttr: 'key2', value: 'val3' });
        });

        describe('methods', function () {
            var list;

            beforeEach(function () {
                var FakeType;

                FakeType = function (options) {
                    this.keyAttr = options.keyAttr;
                    this.value = options.value;
                };

                FakeType._postman_propertyIndexKey = 'keyAttr';
                FakeType._postman_propertyAllowsMultipleValues = true;

                list = new PropertyList(FakeType, {}, [{
                    keyAttr: 'key1',
                    value: 'val1'
                }, {
                    keyAttr: 'key1',
                    value: 'val2'
                }, {
                    keyAttr: 'key2',
                    value: 'val3'
                }]);

                expect(list.reference.key1).to.eql([
                    { keyAttr: 'key1', value: 'val1' },
                    { keyAttr: 'key1', value: 'val2' }
                ]);
            });

            it('.one() should always the last item inserted, even if multiple are present', function () {
                expect(list.one('key1')).to.eql({ keyAttr: 'key1', value: 'val2' });
            });

            it('.one() should return undefined if item is not found', function () {
                expect(list.one('asdjhaks')).to.be(undefined);
            });

            it('.remove() should remove all associated values with the key', function () {
                list.remove('key1');
                expect(list.reference.key1).to.be(undefined);
            });

            afterEach(function () {
                list = undefined;
            });
        });
    });

    describe('.isPropertyList()', function () {
        var list,
            rawList = [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }, {
                keyAttr: 'key2',
                value: 'val3'
            }],
            FakeType = function (options) {
                this.keyAttr = options.keyAttr;
                this.value = options.value;
            };

        FakeType._postman_propertyIndexKey = 'keyAttr';
        FakeType._postman_propertyAllowsMultipleValues = true;

        list = new PropertyList(FakeType, {}, rawList);

        it('should return true for a PropertyList instance', function () {
            expect(PropertyList.isPropertyList(list)).to.be(true);
        });

        it('should return false for a raw PropertyList object', function () {
            expect(PropertyList.isPropertyList(rawList)).to.be(false);
        });

        it('should return false when called without arguments', function () {
            expect(PropertyList.isPropertyList()).to.be(false);
        });
    });

    describe('.toObject()', function () {
        var FakeType;

        beforeEach(function () {
            FakeType = function (options) {
                this.keyAttr = options.keyAttr;
                this.value = options.value;
                this.disabled = options.disabled;
            };

            FakeType._postman_propertyIndexKey = 'keyAttr';
            FakeType._postman_propertyIndexCaseInsensitive = true;
            FakeType._postman_propertyAllowsMultipleValues = false;
            FakeType.prototype.valueOf = function () {
                return this.value;
            };
        });

        afterEach(function () {
            FakeType = null;
        });

        it('should return a pojo', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }, {
                keyAttr: 'key2',
                value: 'val3'
            }]);

            expect(list.toObject()).to.eql({
                key1: 'val2',
                key2: 'val3'
            });
        });

        it('should be able to override case sensitivity return a pojo', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'KEY1',
                value: 'val2',
                disabled: true
            }, {
                keyAttr: 'key2',
                value: 'val3'
            }]);

            expect(list.toObject(null, true)).to.eql({
                key1: 'val1',
                KEY1: 'val2',
                key2: 'val3'
            });
        });

        it('should be able to exclude disabled items return a pojo', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key2',
                value: 'val2',
                disabled: true
            }, {
                keyAttr: 'key3',
                value: 'val3'
            }]);

            expect(list.toObject(true)).to.eql({
                key1: 'val1',
                key3: 'val3'
            });
        });

        it('should return multiple values as array', function () {
            FakeType._postman_propertyAllowsMultipleValues = true;

            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }, {
                keyAttr: 'key2',
                value: 'val3'
            }]);

            expect(list.toObject()).to.eql({
                key1: ['val1', 'val2'],
                key2: 'val3'
            });
        });
    });

    describe('.get()', function () {
        var FakeType = function (options) {
            this.keyAttr = options.keyAttr;
            this.value = options.value;
            this.disabled = options.disabled;
        };

        FakeType._postman_propertyIndexKey = 'keyAttr';
        FakeType._postman_propertyIndexCaseInsensitive = true;
        FakeType._postman_propertyAllowsMultipleValues = false;
        FakeType.prototype.valueOf = function () {
            return this.value;
        };

        it('should return a pojo', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }, {
                keyAttr: 'key2',
                value: 'val3'
            }]);

            expect(list.get('key1')).to.eql('val2');
        });
    });

    describe('.remove()', function () {
        var FakeType = function (options) {
            this.keyAttr = options.keyAttr;
            this.value = options.value;
            _.has(options, 'disabled') && (this.disabled = options.disabled);
        };

        FakeType._postman_propertyIndexKey = 'keyAttr';
        FakeType._postman_propertyIndexCaseInsensitive = true;
        FakeType._postman_propertyAllowsMultipleValues = true;
        FakeType.prototype.valueOf = function () {
            return this.value;
        };

        it('should remove an element from the property list members array', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }, {
                keyAttr: 'key2',
                value: 'val3'
            }]);

            list.remove(function (fake) {
                return fake.keyAttr === 'key1' && fake.value === 'val2';
            });

            // should have removed exactly the one element from the members array
            expect(list.toJSON()).to.eql([
                { keyAttr: 'key1', value: 'val1' },
                { keyAttr: 'key2', value: 'val3' }
            ]);
        });


        it('should remove an element from the property list reference map', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }, {
                keyAttr: 'key2',
                value: 'val3'
            }]);

            // Ensure that the reference array contains an array of values for `key1`
            expect(list.reference.key1).to.be.an(Array);
            expect(list.reference.key1).to.have.length(2);

            list.remove(function (fake) {
                return fake.keyAttr === 'key1' && fake.value === 'val2';
            });

            // should have removed the correct element from the reference map, and removed the array of values
            expect(list.reference.key1).to.not.be.an(Array);
            expect(list.reference.key1).to.eql({
                keyAttr: 'key1',
                value: 'val1'
            });
        });

        it('should remove an element from the property list reference map and remove associated array', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }, {
                keyAttr: 'key2',
                value: 'val3'
            }]);

            // Ensure that the reference array contains an array of values for `key1`
            expect(list.reference.key1).to.be.an(Array);
            expect(list.reference.key1).to.have.length(2);

            list.remove(function (fake) {
                return fake.keyAttr === 'key1';
            });

            // should have removed the array of values
            expect(list.reference.key1).to.be(undefined);
        });
    });

    describe('.has()', function () {
        var FakeType = function (options) {
            this.keyAttr = options.keyAttr;
            this.value = options.value;
            this.disabled = options.disabled;
        };

        FakeType._postman_propertyIndexKey = 'keyAttr';
        FakeType._postman_propertyIndexCaseInsensitive = true;
        FakeType._postman_propertyAllowsMultipleValues = true;
        FakeType.prototype.valueOf = function () {
            return this.value;
        };

        it('should check if given key exists in the property list', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key2',
                value: 'val2'
            }, {
                keyAttr: 'key3',
                value: 'val3'
            }]);

            expect(list.has('key1')).to.eql(true);
        });

        it('should return a falsey value if the key does not exist', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key2',
                value: 'val2'
            }, {
                keyAttr: 'key3',
                value: 'val3'
            }]);

            expect(list.has('something')).to.eql(false);
        });

        it('should handle if a key has multiple values', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }, {
                keyAttr: 'key2',
                value: 'val3'
            }]);

            expect(list.has('key1')).to.eql(true);
        });

        it('should handle if a particular value is provided for lookup', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }, {
                keyAttr: 'key1',
                value: 'val3'
            }, {
                keyAttr: 'key2',
                value: 'val4'
            }]);

            expect(list.has('key1', 'val1')).to.eql(true);
            expect(list.has('key1', 'val2')).to.eql(true);
            expect(list.has('key1', 'val3')).to.eql(true);
        });

        it('should return false if a particular value is provided for lookup but does not exist', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }, {
                keyAttr: 'key1',
                value: 'val3'
            }, {
                keyAttr: 'key2',
                value: 'val4'
            }]);

            expect(list.has('key1', 'val4')).to.eql(false);
        });

        it('should return a falsey value if the key does not exist', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key2',
                value: 'val2'
            }, {
                keyAttr: 'key3',
                value: 'val3'
            }]);

            expect(list.has('key4', 'val3')).to.eql(false);
        });

        it('should return true if the item is provided', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key2',
                value: 'val2'
            }, {
                keyAttr: 'key3',
                value: 'val3'
            }]);

            expect(list.has(list.members[0])).to.eql(true);
        });

        it('should return true if key and value exist, but no duplicate values exist', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key2',
                value: 'val2'
            }, {
                keyAttr: 'key3',
                value: 'val3'
            }]);

            expect(list.has('key1', 'val1')).to.eql(true);
        });
    });
});
