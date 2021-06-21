var _ = require('lodash'),
    expect = require('chai').expect,
    PropertyList = require('../../lib/index.js').PropertyList,
    Item = require('../../lib/index.js').Item,

    // we use this function to make test result error outputs a bit more easy to read
    extractId = function (item) {
        return item.id;
    };

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

        expect(list.one('woahwoah')).to.be.undefined;
        expect(list.one('Yololo')).to.be.undefined; // cross check lowercase lookup to fail
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

        expect(list.count()).to.equal(1);
        list.remove('Yololo'); // remove using different case. it should not work
        expect(list.count()).to.equal(1);
        expect(Object.keys(list.reference)).to.eql(['yoLoLo']);

        list.remove('yoLoLo');
        expect(list.count()).to.equal(0);
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

        expect(list.count()).to.equal(1);
        expect(Object.keys(list.reference)).to.eql(['yololo']);
        list.remove('Yololo');
        expect(list.count()).to.equal(0);
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

        expect(list.count()).to.equal(2);
        list.remove(function (item) {
            return (item.keyAttr === 'yoLoLo1');
        });

        expect(list.count()).to.equal(1);
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

        expect(list.count()).to.equal(0);
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

        expect(list.count()).to.equal(2);

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

        it('test fixtures should be available', function () {
            expect(enterprise).to.be.an.instanceof(PropertyList);
            expect(enterprise.count()).to.equal(0);
            expect(maverick).to.be.an.instanceof(Item);
            expect(goose).to.be.an.instanceof(Item);
            expect(maverick).to.not.equal(goose);
            expect(goose).to.not.equal(stinger);
            expect(maverick.id).to.equal('maverick');
            expect(goose.id).to.equal('goose');
            expect(stinger.id).to.equal('stinger');
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

            it('.one() should always return the last item inserted, even if multiple are present', function () {
                expect(list.one('key1')).to.eql({ keyAttr: 'key1', value: 'val2' });
            });

            it('.one() should return undefined if item is not found', function () {
                expect(list.one('asdjhaks')).to.be.undefined;
            });

            it('.remove() should remove all associated values with the key', function () {
                list.remove('key1');
                expect(list.reference.key1).to.be.undefined;
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
            expect(PropertyList.isPropertyList(list)).to.be.true;
        });

        it('should return false for a raw PropertyList object', function () {
            expect(PropertyList.isPropertyList(rawList)).to.be.false;
        });

        it('should return false when called without arguments', function () {
            expect(PropertyList.isPropertyList()).to.be.false;
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

            FakeType._postman_sanitizeKeys = false;
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

        it('should respect the in-built sanitize property', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: '',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }]);

            expect(list.toObject()).to.eql({ '': 'val1', key1: 'val2' });
        });

        it('should correctly handle the keys with the sanitize option', function () {
            var list = new PropertyList(FakeType, {}, [{
                keyAttr: '',
                value: 'val1'
            }, {
                keyAttr: 'key1',
                value: 'val2'
            }]);

            expect(list.toObject(false, false, false, true)).to.eql({ key1: 'val2' });
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
            expect(list.reference.key1).to.be.an('array').that.has.lengthOf(2);

            list.remove(function (fake) {
                return fake.keyAttr === 'key1' && fake.value === 'val2';
            });

            // should have removed the correct element from the reference map, and removed the array of values
            expect(list.reference.key1).to.not.be.an('array');
            expect(list.toJSON()).to.eql([{
                keyAttr: 'key1',
                value: 'val1'
            }, {
                keyAttr: 'key2',
                value: 'val3'
            }]);
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
            expect(list.reference.key1).to.be.an('array').that.has.lengthOf(2);

            list.remove(function (fake) {
                return fake.keyAttr === 'key1';
            });

            // should have removed the array of values
            expect(list.reference).to.not.have.property('key1');
        });

        it('should correctly remove an element by direct reference', function () {
            var entity = new FakeType({ keyAttr: 'key', value: 'val' }),
                list = new PropertyList(FakeType, {}, [entity]);

            list.remove(entity);

            // should have removed the correct element from the reference map, and removed the array of values
            expect(list.reference).to.not.have.property('key');
        });
    });

    describe('.each', function () {
        var FakeType = function (options) {
            this.key = options.key;
            this.value = options.value;
        };

        it('should handle non-function iterators correctly', function () {
            var pList = new PropertyList(FakeType, {}, [
                { key: 'foo', value: 'bar' }
            ]);

            expect(function () { pList.each.bind(pList)({ foo: 'bar' }); }).to.not.throw();
            expect(function () { pList.each.bind(pList)(undefined); }).to.not.throw();
            expect(pList.each.bind(pList)).to.not.throw();
        });
    });

    describe('.eachParent', function () {
        var FakeType = function (options) {
            this.key = options.key;
            this.value = options.value;
        };

        it('should bail out if the iterator is not a function', function () {
            var pList = new PropertyList(FakeType, {}, []);

            expect(function () { pList.eachParent.bind(pList)('random'); }).to.not.throw();
            expect(function () { pList.eachParent.bind(pList)(undefined); }).to.not.throw();
            expect(pList.eachParent.bind(pList)).to.not.throw();
        });

        it('should correctly bind the context to the iterator if one is provided', function () {
            var parent = new PropertyList(FakeType, {}, [{ key: 'level', value: 'parent' }]),
                pList = new PropertyList(FakeType, parent, [{ key: 'level', value: 'child' }]),
                chain = [];

            pList.eachParent(function (parent) {
                parent.members && chain.push(parent.members[0][this.attr]);
            }, {
                attr: 'value'
            });

            expect(chain).to.eql(['parent']);
        });

        it('should use the default context of the caller instance if none is provided', function () {
            var parent = new PropertyList(FakeType, {}, [{ key: 'level', value: 'parent' }]),
                pList = new PropertyList(FakeType, parent, [{ key: 'level', value: 'child' }]),
                chain = [];

            pList.eachParent(function (parent) {
                expect(this.toJSON()).to.eql([{ key: 'level', value: 'child' }]);
                parent.members && chain.push(parent.members[0].value);
            });

            expect(chain).to.eql(['parent']);
        });
    });

    describe('.filter', function () {
        var FakeType = function (options) {
            this.key = options.key;
            this.value = options.value;
        };

        it('should correctly bind the iterator to the provided context', function () {
            var pList = new PropertyList(FakeType, {}, [
                { key: 'foo', value: 'bar' },
                { key: 'alpha', value: 'bar' },
                { key: 'gamma', value: 'baz' }
            ]);

            expect(pList.filter(function (property) {
                return property.value === this.value;
            }, { value: 'bar' })).to.eql([
                { key: 'foo', value: 'bar' },
                { key: 'alpha', value: 'bar' }
            ]);
        });
    });

    describe('.find', function () {
        var FakeType = function (options) {
            this.key = options.key;
            this.value = options.value;
        };

        it('should correctly bind the iterator to the provided context', function () {
            var pList = new PropertyList(FakeType, {}, [
                { key: 'foo', value: 'bar' },
                { key: 'alpha', value: 'bar' },
                { key: 'gamma', value: 'baz' }
            ]);

            expect(pList.find(function (property) {
                return property.key === this.key;
            }, { key: 'alpha' })).to.eql({ key: 'alpha', value: 'bar' });
        });
    });

    describe('.insert', function () {
        it('should bail out for non-object arguments', function () {
            var pList = new PropertyList();

            pList.insert();
            expect(pList.members).to.eql([]);
        });

        // Refer: https://github.com/postmanlabs/postman-app-support/issues/8924
        it('should be able to insert hasOwnProperty as a key', function () {
            var FakeType = function (options) {
                    this.key = options.key;
                    this.value = options.value;
                },
                list;

            FakeType._postman_propertyIndexKey = 'key';
            FakeType._postman_propertyAllowsMultipleValues = true;

            list = new PropertyList(FakeType, {}, { key: 'hasOwnProperty', value: '0' });
            list.insert({ key: 'hasOwnProperty', value: '1' });

            expect(list.reference.hasOwnProperty).to.eql([
                { key: 'hasOwnProperty', value: '0' },
                { key: 'hasOwnProperty', value: '1' }
            ]);
        });
    });

    describe('.add', function () {
        it('should bail out for null, undefined, or NaN input', function () {
            var pList = new PropertyList();

            pList.add(null);
            expect(pList.members).to.be.empty;

            pList.add(undefined);
            expect(pList.members).to.be.empty;

            pList.add(NaN);
            expect(pList.members).to.be.empty;
        });
    });

    describe('upsert method', function () {
        var FakeType = function (opts) {
            _.assign(this, opts);
        };

        FakeType._postman_propertyIndexKey = 'key';
        FakeType.prototype.update = function (opts) {
            _.assign(this, opts);
        };

        it('should be able to add a key that is not existing', function () {
            var list = new PropertyList(FakeType, null, [{
                key: 'key1',
                val: 'value1'
            }]);

            // just verifying
            expect(list.toJSON()).to.eql([{
                key: 'key1',
                val: 'value1'
            }]);

            list.upsert({
                key: 'key2',
                val: 'value2'
            });

            expect(list.toJSON()).to.eql([{
                key: 'key1',
                val: 'value1'
            }, {
                key: 'key2',
                val: 'value2'
            }]);
        });

        it('should be able to update a key that is existing', function () {
            var list = new PropertyList(FakeType, null, [{
                key: 'key1',
                val: 'value1'
            }, {
                key: 'key2',
                val: 'value2'
            }]);

            list.upsert({
                key: 'key1',
                val: 'value1-updated'
            });

            expect(list.toJSON()).to.eql([{
                key: 'key1',
                val: 'value1-updated'
            }, {
                key: 'key2',
                val: 'value2'
            }]);
        });

        it('should not add null, undefined, and undefined items', function () {
            var list = new PropertyList(FakeType, null, [{
                key: 'key1',
                val: 'value1'
            }]);

            list.upsert();
            list.upsert(NaN);
            list.upsert(null);
            list.upsert(undefined);

            expect(list.toJSON()).to.eql([{
                key: 'key1',
                val: 'value1'
            }]);
        });
    });

    describe('.update not defined property list', function () {
        it('should throw error when .upsert called on propertyList that does not support .update()', function () {
            var FakeType,
                list;

            FakeType = function (opts) {
                _.assign(this, opts);
            };
            FakeType._postman_propertyIndexKey = 'key';
            FakeType.prototype.update = null;
            list = new PropertyList(FakeType, null, [{
                key: 'key1',
                val: 'value1'
            }]);

            expect(function () {
                list.upsert({
                    key: 'key1',
                    val: 'value1-updated'
                });
            }).to.throw('collection: unable to upsert into a list of Type that does not support .update()');
        });

        it('should throw error when .assimilate called on propertyList that does not support .update()', function () {
            var FakeType,
                list1, sourceListArray;

            FakeType = function (opts) {
                _.assign(this, opts);
            };
            FakeType._postman_propertyIndexKey = 'key';
            FakeType.prototype.update = null;
            list1 = new PropertyList(FakeType, null, [{
                key: 'key1',
                val: 'value1'
            }]);
            sourceListArray = new PropertyList(FakeType, null, [{
                key: 'key1',
                val: 'value1-updated'
            }]);

            expect(function () {
                list1.assimilate(sourceListArray);
            }).to.throw('collection: unable to upsert into a list of Type that does not support .update()');
        });
    });

    describe('assimilate method', function () {
        var FakeType = function (opts) {
            _.assign(this, opts);
        };

        FakeType._postman_propertyIndexKey = 'key';
        FakeType.prototype.update = function (opts) {
            _.assign(this, opts);
        };

        it('should be able to add items from another list', function () {
            var list1 = new PropertyList(FakeType, null, [{
                    key: 'key1',
                    val: 'value1'
                }]),
                sourceListArray = new PropertyList(FakeType, null, [{
                    key: 'key2',
                    val: 'value2'
                }]);

            list1.assimilate(sourceListArray);

            expect(list1.toJSON()).to.eql([{
                key: 'key1',
                val: 'value1'
            }, {
                key: 'key2',
                val: 'value2'
            }]);
        });

        it('should be able to update existing keys while assimilating from another list', function () {
            var list1 = new PropertyList(FakeType, null, [{
                    key: 'key1',
                    val: 'value1'
                }, {
                    key: 'key2',
                    val: 'value2-old'
                }]),
                list2 = new PropertyList(FakeType, null, [{
                    key: 'key2',
                    val: 'value2'
                }]);

            list1.assimilate(list2);

            expect(list1.toJSON()).to.eql([{
                key: 'key1',
                val: 'value1'
            }, {
                key: 'key2',
                val: 'value2'
            }]);
        });

        it('should be able to add items from another list and prune extra items', function () {
            var list1 = new PropertyList(FakeType, null, [{
                    key: 'key1',
                    val: 'value1'
                }]),
                list2 = new PropertyList(FakeType, null, [{
                    key: 'key2',
                    val: 'value2'
                }]);

            list1.assimilate(list2, true);

            expect(list1.toJSON()).to.eql([{
                key: 'key2',
                val: 'value2'
            }]);
        });

        it('should add items if source is array with valid object', function () {
            var list1 = new PropertyList(FakeType, null, [{
                    key: 'key1',
                    val: 'value1'
                }]),
                sourceObjectArray = [{
                    key: 'key2',
                    val: 'value2'
                }];

            list1.assimilate(sourceObjectArray);

            expect(list1.toJSON()).to.eql([{
                key: 'key1',
                val: 'value1'
            },
            {
                key: 'key2',
                val: 'value2'
            }]);
        });

        it('should not add items if source is invalid', function () {
            var list1 = new PropertyList(FakeType, null, [{
                    key: 'key1',
                    val: 'value1'
                }]),
                sourceObject = {
                    key: 'key2',
                    val: 'value2'
                };

            list1.assimilate(sourceObject);

            expect(list1.toJSON()).to.eql([{
                key: 'key1',
                val: 'value1'
            }]);
        });
    });

    describe('.toJSON', function () {
        var FakeType = function (options) {
            this.key = options.key;
            _.has(options, 'value') && (this.value = options.value);
            _.has(options, 'values') && (this.values = options.values);
        };

        it('should handle various kinds of values correctly', function () {
            var pList = new PropertyList(FakeType, {}, [
                { key: 'alpha', value: undefined },
                { key: 'beta', value: {} },
                { key: 'gamma', value: { val: 'random', toJSON: function () { return this.val; } } },
                { key: 'delta', values: new PropertyList(FakeType, {}, []) }
            ]);

            expect(pList.toJSON()).to.eql([
                { key: 'alpha' },
                { key: 'beta', value: {} },
                { key: 'gamma', value: 'random' },
                { key: 'delta', value: [] }
            ]);
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

            expect(list.has('key1')).to.be.true;
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

            expect(list.has('something')).to.be.false;
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

            expect(list.has('key1')).to.be.true;
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

            expect(list.has('key1', 'val1')).to.be.true;
            expect(list.has('key1', 'val2')).to.be.true;
            expect(list.has('key1', 'val3')).to.be.true;
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

            expect(list.has('key1', 'val4')).to.be.false;
        });

        it('should return false if the key-value pair does not exist', function () {
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

            expect(list.has('key4', 'val3')).to.be.false;
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

            expect(list.has(list.members[0])).to.be.true;
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

            expect(list.has('key1', 'val1')).to.be.true;
        });
    });

    describe('.toString', function () {
        it('should handle when unparse method not defined in Type and constructor set to null', function () {
            var FakeType,
                list1;

            FakeType = function (opts) {
                _.assign(this, opts);
            };
            FakeType._postman_propertyIndexKey = 'key';
            list1 = new PropertyList(FakeType, null, [{
                key: 'key1',
                val: 'value1'
            }]);

            list1.constructor = null;
            expect(list1.toString()).to.eql('');
        });

        it('should handle use constructor toString if defined', function () {
            var FakeType,
                list1;

            FakeType = function (opts) {
                _.assign(this, opts);
            };
            FakeType._postman_propertyIndexKey = 'key';
            list1 = new PropertyList(FakeType, null, [{
                key: 'key1',
                val: 'value1'
            }]);

            list1.constructor = Object;
            expect(list1.toString()).to.eql('[object Object]');
        });
    });
});
