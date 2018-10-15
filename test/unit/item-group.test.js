var _ = require('lodash'),
    expect = require('chai').expect,
    fixtures = require('../fixtures'),
    sdk = require('../../lib/index.js'),
    Item = sdk.Item,
    ItemGroup = sdk.ItemGroup,
    Collection = sdk.Collection;

describe('ItemGroup', function () {
    describe('constructor', function () {
        it('should handle all properties', function () {
            var itemGroupDefinition = {
                    auth: {
                        type: 'basic',
                        basic: [{
                            key: 'username',
                            type: 'string',
                            value: 'postman'
                        }, {
                            key: 'password',
                            type: 'string',
                            value: 'password'
                        }]
                    },
                    event: [{
                        listen: 'test',
                        script: {
                            id: 'my-script-1',
                            type: 'text/javascript',
                            exec: ['console.log("This doesn\'t matter");']
                        }
                    }]
                },
                itemGroup = new ItemGroup(itemGroupDefinition);

            expect(itemGroup).to.deep.include({
                events: new sdk.EventList({}, itemGroupDefinition.event),
                auth: new sdk.RequestAuth(itemGroupDefinition.auth)
            });
            expect(itemGroup).to.have.property('items');
        });

        it('should not create auth if auth is falsy', function () {
            var itemGroupDefinition = {
                    auth: null
                },
                itemGroup = new ItemGroup(itemGroupDefinition);

            expect(itemGroup).to.not.have.property('auth');
            expect(itemGroup.toJSON()).to.not.have.property('auth');
        });
    });
    it('should be able to iterate over all subfolders', function () {
        var rawCollection = fixtures.collectionV2,
            collection = new Collection(rawCollection),
            groups = [];

        collection.forEachItemGroup(function (group) {
            groups.push(group);
        });
        expect(groups.length).to.equal(4);
    });

    it('should correctly handle incoming items/item groups and/or plain objects', function () {
        var plain = ItemGroup._createNewGroupOrItem({
                request: {
                    url: 'https://postman-echo.com/get',
                    method: 'GET'
                }
            }),
            item = ItemGroup._createNewGroupOrItem(new sdk.Item({
                request: {
                    url: 'https://postman-echo.com/get',
                    method: 'GET'
                }
            })),
            group = ItemGroup._createNewGroupOrItem(new sdk.ItemGroup({ name: 'Blank folder' }));

        expect(plain).to.be.ok;
        expect(plain.events).to.be.ok;
        expect(plain.responses).to.be.ok;
        expect(plain.request).to.have.property('method', 'GET');
        expect(plain.request.url).to.deep.include({
            path: ['get'],
            host: ['postman-echo', 'com']
        });

        expect(item).to.be.ok;
        expect(item.events).to.be.ok;
        expect(item.responses).to.be.ok;
        expect(item.request).to.have.property('method', 'GET');
        expect(item.request.url).to.deep.include({
            path: ['get'],
            host: ['postman-echo', 'com']
        });

        expect(_.omit(group.toJSON(), 'id')).to.eql({ name: 'Blank folder', item: [], event: [] });
    });

    describe('sanity', function () {
        var rawItemGroup = fixtures.collectionV2,
            itemGroup = new ItemGroup(rawItemGroup);

        it('initializes successfully', function () {
            expect(itemGroup).to.be.ok;
        });

        describe('has property', function () {
            it('id', function () {
                expect(itemGroup).to.have.property('id', rawItemGroup.info.id);
            });

            it('item', function () {
                expect(itemGroup).to.have.property('items').that.is.an('object');
                expect(itemGroup.items.all()).to.be.an('array').that.has.lengthOf(3);
            });

            it('name', function () {
                expect(itemGroup).to.have.property('name', rawItemGroup.info.name);
            });
            it('events', function () {
                expect(itemGroup).to.have.property('events');
                expect(itemGroup.events.all()).to.be.an('array').that.has.lengthOf(2);
            });
        });

        describe('has function', function () {
            it('forEachItem', function () {
                expect(itemGroup.forEachItem).to.be.ok;
                expect(itemGroup.forEachItem).to.be.a('function');
            });
        });
    });

    describe('.parent checks', function () {
        var collection = new Collection(fixtures.nestedCollectionV2);

        it('should work correctly for nested collections', function () {
            collection.forEachItemGroup(function (group) {
                var groupIds = [],
                    parentIds = [],
                    parent = group.parent();

                while (parent) {
                    parentIds.push(parent.id);
                    expect(parent).to.include.keys(['description', 'id', 'name', 'items', 'events']);
                    parent = parent.parent();
                }

                collection.forEachItemGroup(function (item) {
                    groupIds.unshift(item.id);
                });

                // The top most parent is always the collection, check that here
                expect(parentIds.pop()).to.equal(collection.id);

                // Check that the parents returned by .parent are in the same order as those of the itemGroup list
                _.forEach(parentIds, function (id, index) {
                    expect(id).to.equal(groupIds[index]);
                });
            });
        });

        it('should work correctly for a nested itemGroup', function () {
            var f2 = collection.items.members[1],
                f3 = f2.items.members[0],
                parent = f3.parent();

            expect(parent.name).to.equal(f2.name);
        });

        it('should work correctly for a first level itemGroup', function () {
            var f1 = collection.items.members[0],
                parent = f1.parent();

            expect(parent.name).to.equal(collection.name);
        });
    });

    describe('.forEachItem', function () {
        it('should correctly iterate over a nested list of items and item groups', function () {
            var result = [],
                itemGroup = new ItemGroup({
                    id: 'F0',
                    name: 'F0-name',
                    item: [{
                        id: 'R1',
                        name: 'R1-name',
                        request: 'postman-echo.com'
                    }, {
                        id: 'F2',
                        name: 'F2-name',
                        item: [{
                            id: 'R2',
                            name: 'R2-name',
                            request: 'postman-echo.com'
                        }, {
                            id: 'R3',
                            name: 'R3-name',
                            request: 'postman-echo.com'
                        }, {
                            id: 'F3',
                            name: 'F3-name',
                            item: [{
                                id: 'R4',
                                name: 'R4-name',
                                request: 'postman-echo.com'
                            }, {
                                id: 'F4',
                                name: 'F4-name',
                                item: []
                            }]
                        }]
                    }, {
                        id: 'R5',
                        name: 'R5-name',
                        request: 'postman-echo.com'
                    }, {
                        id: 'F5',
                        name: 'F5-name',
                        item: []
                    }]
                });

            itemGroup.forEachItem(function (item) { result.push(item.name); });
            expect(result).to.eql(['R1-name', 'R2-name', 'R3-name', 'R4-name', 'R5-name']);
        });
    });

    describe('.oneDeep()', function () {
        var itemGroupData = {
                id: 'F0',
                name: 'F0-name',
                item: [{
                    id: 'R1',
                    name: 'R1-name',
                    request: 'postman-echo.com'
                }, {
                    id: 'F2',
                    name: 'F2-name',
                    item: [{
                        id: 'R2',
                        name: 'R2-name',
                        request: 'postman-echo.com'
                    }, {
                        id: 'R3',
                        name: 'R3-name',
                        request: 'postman-echo.com'
                    }, {
                        id: 'F3',
                        name: 'F3-name',
                        item: [{
                            id: 'R4',
                            name: 'R4-name',
                            request: 'postman-echo.com'
                        }, {
                            id: 'F4',
                            name: 'F4-name',
                            item: []
                        }]
                    }]
                }, {
                    id: 'R5',
                    name: 'R5-name',
                    request: 'postman-echo.com'
                }, {
                    id: 'F5',
                    name: 'F5-name',
                    item: []
                }]
            },
            itemGroup;

        beforeEach(function () {
            itemGroup = new ItemGroup(itemGroupData);
        });

        afterEach(function () {
            itemGroup = undefined;
        });

        describe('should fetch items', function () {
            describe('in the root', function () {
                it('by id', function () {
                    var r = itemGroup.oneDeep('R1');
                    expect(Item.isItem(r)).to.be.true;
                    expect(r).to.have.property('name', 'R1-name');
                });

                it('by name', function () {
                    var r = itemGroup.oneDeep('R1-name');
                    expect(Item.isItem(r)).to.be.true;
                    expect(r).to.have.property('id', 'R1');
                });
            });

            describe('in an immediate sub-group', function () {
                it('by id', function () {
                    var r = itemGroup.oneDeep('R2');
                    expect(Item.isItem(r)).to.be.true;
                    expect(r).to.have.property('name', 'R2-name');
                });

                it('by name', function () {
                    var r = itemGroup.oneDeep('R2-name');
                    expect(Item.isItem(r)).to.be.true;
                    expect(r).to.have.property('id', 'R2');
                });
            });

            describe('in a nested subgroup', function () {
                it('by id', function () {
                    var r = itemGroup.oneDeep('R4');
                    expect(Item.isItem(r)).to.be.true;
                    expect(r).to.have.property('name', 'R4-name');
                });

                it('by name', function () {
                    var r = itemGroup.oneDeep('R4-name');
                    expect(Item.isItem(r)).to.be.true;
                    expect(r).to.have.property('id', 'R4');
                });
            });
        });

        describe('should fetch itemgroups', function () {
            describe('in the root', function () {
                it('by id', function () {
                    var f1, f2;

                    f1 = itemGroup.oneDeep('F2');
                    expect(ItemGroup.isItemGroup(f1)).to.be.true;
                    expect(f1).to.have.property('name', 'F2-name');

                    f2 = itemGroup.oneDeep('F5');
                    expect(ItemGroup.isItemGroup(f2)).to.be.true;
                    expect(f2).to.have.property('name', 'F5-name');
                });

                it('by name', function () {
                    var f1, f2;

                    f1 = itemGroup.oneDeep('F2-name');
                    expect(ItemGroup.isItemGroup(f1)).to.be.true;
                    expect(f1).to.have.property('id', 'F2');

                    f2 = itemGroup.oneDeep('F5-name');
                    expect(ItemGroup.isItemGroup(f2)).to.be.true;
                    expect(f2).to.have.property('id', 'F5');
                });
            });

            describe('in an immediate sub-group', function () {
                it('by id', function () {
                    var f1;

                    f1 = itemGroup.oneDeep('F3');
                    expect(ItemGroup.isItemGroup(f1)).to.be.true;
                    expect(f1).to.have.property('name', 'F3-name');
                });

                it('by name', function () {
                    var f1;

                    f1 = itemGroup.oneDeep('F3-name');
                    expect(ItemGroup.isItemGroup(f1)).to.be.true;
                    expect(f1).to.have.property('id', 'F3');
                });
            });

            describe('in a nested subgroup', function () {
                it('by id', function () {
                    var f1;

                    f1 = itemGroup.oneDeep('F4');
                    expect(ItemGroup.isItemGroup(f1)).to.be.true;
                    expect(f1).to.have.property('name', 'F4-name');
                });

                it('by name', function () {
                    var f1;

                    f1 = itemGroup.oneDeep('F4-name');
                    expect(ItemGroup.isItemGroup(f1)).to.be.true;
                    expect(f1).to.have.property('id', 'F4');
                });
            });
        });

        it('should return `undefined` if the item does not exist', function () {
            var i;

            i = itemGroup.oneDeep('non-existent');

            expect(i).to.be.undefined;
        });

        it('should return `undefined` if the specified id is not a string', function () {
            expect(itemGroup.oneDeep(1)).to.be.undefined;
        });
    });

    describe('.authoriseRequestsUsing', function () {
        it('should be able to set an authentication property using a specific type', function () {
            var group = new ItemGroup();

            group.authorizeRequestsUsing('noauth', {
                foo: 'bar'
            });

            group.authorizeRequestsUsing('basic', {
                username: 'foo',
                password: 'bar'
            });

            expect(group.auth.toJSON()).to.eql({
                type: 'basic',
                noauth: [
                    { type: 'any', value: 'bar', key: 'foo' }
                ],
                basic: [
                    { type: 'any', value: 'foo', key: 'username' },
                    { type: 'any', value: 'bar', key: 'password' }
                ]
            });
        });
    });

    describe('isItemGroup', function () {
        it('should return true for a ItemGroup instance', function () {
            expect(sdk.ItemGroup.isItemGroup(new sdk.ItemGroup(fixtures.collectionV2.item))).to.be.true;
        });

        it('should return false for a raw ItemGroup object', function () {
            expect(sdk.ItemGroup.isItemGroup(fixtures.collectionV2.item)).to.be.false;
        });

        it('should return false when called without arguments', function () {
            expect(sdk.ItemGroup.isItemGroup()).to.be.false;
        });
    });

    describe('.toJSON', function () {
        it('should handle all properties', function () {
            var itemGroupDefinition = {
                    id: 'my-folder',
                    event: [{
                        listen: 'test',
                        script: {
                            id: 'my-test-script',
                            type: 'text/javascript',
                            exec: ['console.log("hello there!");']
                        }
                    }],
                    item: [{
                        event: [],
                        id: 'my-item',
                        request: {
                            method: 'GET',
                            url: {
                                host: ['postmanecho', 'com'],
                                path: ['get'],
                                protocol: 'https',
                                query: [],
                                variable: []
                            }
                        },
                        response: []
                    }]
                },
                itemGroup = new ItemGroup(itemGroupDefinition),
                itemGroupJSON = itemGroup.toJSON();

            expect(itemGroupJSON).to.eql(itemGroupDefinition);
        });
    });
});
