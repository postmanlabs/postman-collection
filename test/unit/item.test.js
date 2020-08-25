var expect = require('chai').expect,
    fixtures = require('../fixtures'),
    sdk = require('../../lib/index.js'),

    Request = require('../../lib/index.js').Request,
    Item = require('../../lib/index.js').Item;

describe('Item', function () {
    var rawItem = fixtures.collectionV2.item[0],
        item = new sdk.Item(rawItem);

    describe('constructor', function () {
        it('should handle all properties', function () {
            var itemDefinition = {
                    id: 'peter-pan',
                    event: [{
                        listen: 'test',
                        script: {
                            id: 'my-script-1',
                            type: 'text/javascript',
                            exec: ['console.log("This doesn\'t matter");']
                        }
                    }],
                    request: {
                        method: 'GET',
                        url: {
                            host: ['postman-echo', 'com'],
                            'protocol': 'http',
                            'query': [],
                            'variable': []
                        },
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
                        }
                    },
                    response: [],
                    protocolProfileBehavior: {
                        disableBodyPruning: true
                    }
                },
                item = new Item(itemDefinition);

            expect(item.toJSON()).to.eql(itemDefinition);
        });
    });

    describe('sanity', function () {
        describe('request', function () {
            var rawItem = fixtures.collectionV2.item[0],
                item = new Item(rawItem);

            it('initializes successfully', function () {
                expect(item).to.be.ok;
            });

            describe('has property', function () {
                it('description', function () {
                    expect(item).to.have.property('description').that.is.an('object');
                });

                it('events', function () {
                    expect(item).to.have.property('events');
                    expect(item.events.all()).to.be.an('array').that.has.lengthOf(2);
                });

                it('id', function () {
                    expect(item).to.have.property('id', rawItem.id);
                });

                it('name', function () {
                    expect(item).to.have.property('name', rawItem.name);
                });

                it('request', function () {
                    expect(item).to.have.property('request').that.is.an('object');
                    expect(item.request).to.not.be.empty;
                });

                it('responses', function () {
                    expect(item).to.have.property('responses');
                    expect(item.responses.all()).to.be.an('array').that.has.lengthOf(1);
                });

                it('protocolProfileBehavior', function () {
                    expect(item).to.have.property('protocolProfileBehavior').that.is.an('object');
                    expect(item.protocolProfileBehavior).to.not.be.empty;
                });
            });
        });

        describe('folder', function () {
            var rawItem = fixtures.collectionV2.item[2],
                item = new Item(rawItem);

            it('initializes successfully', function () {
                expect(item).to.be.ok;
            });

            describe('has property', function () {
                it('id', function () {
                    expect(item).to.have.property('id', rawItem.id);
                });

                it('name', function () {
                    expect(item).to.have.property('name', rawItem.name);
                });

                it('request', function () {
                    expect(item).to.have.property('request').that.is.an.instanceOf(Request);
                });
            });
        });

        describe('protocolProfileBehavior', function () {
            it('should not filter unknown protocol profile behaviors', function () {
                var item = new Item({
                    protocolProfileBehavior: {
                        disableBodyPruning: true,
                        random: true
                    }
                });
                expect(item).to.have.property('protocolProfileBehavior').that.eql({
                    disableBodyPruning: true,
                    random: true
                });
            });

            it('should not be included if its not an object', function () {
                expect(new Item({
                    protocolProfileBehavior: true
                })).to.not.have.property('protocolProfileBehavior');

                expect(new Item({
                    protocolProfileBehavior: 'foo'
                })).to.not.have.property('protocolProfileBehavior');

                expect(new Item({
                    protocolProfileBehavior: 123
                })).to.not.have.property('protocolProfileBehavior');
            });
        });
    });

    describe('json representation', function () {
        it('must match what the item was initialized with', function () {
            var jsonified = item.toJSON();

            expect(jsonified.id).to.eql(rawItem.id);

            // All of these have their own proper tests
            // eslint-disable-next-line max-len
            expect(jsonified).to.include.all.keys('description', 'request', 'response', 'event', 'protocolProfileBehavior');
        });
    });

    describe('.parent', function () {
        var collection = new sdk.Collection(fixtures.nestedCollectionV2);

        it('must return a falsy result for a standalone item', function () {
            expect(item.parent()).to.be.undefined;
        });

        it('must work correctly for a nested item', function () {
            var nestedItem = collection.items.members[1].items.members[0].items.members[0],
                parent = nestedItem.parent();

            expect(parent.name).to.equal('F2.F3');
        });

        it('must work correctly for a regular folder item', function () {
            var f1 = collection.items.members[0],
                r1 = f1.items.members[0],
                parent = r1.parent();

            expect(parent.name).to.equal(f1.name);
        });

        it('must work correctly for a first level item', function () {
            var firstLevelItem = collection.items.members[2], // root level request R1
                parent = firstLevelItem.parent();

            expect(parent.name).to.equal(collection.name);
        });
    });

    describe('.getAuth()', function () {
        var item,
            folder,
            collection,
            itemWithAuth,
            folderWithAuth,
            collectionWithAuth,
            itemWithEmptyAuth,
            folderWithEmptyAuth;

        // Create building blocks which we can use in different combinations for the tests.
        beforeEach(function () {
            collection = new sdk.Collection();
            collectionWithAuth = new sdk.Collection({
                auth: { type: 'basic', basic: { username: 'c', password: 'd' } }
            });
            item = new sdk.Item({ name: 'item1', request: 'https://postman-echo.com/get' });
            folder = new sdk.ItemGroup({ name: 'folder1' });
            itemWithAuth = new sdk.Item({
                name: 'item2',
                request: {
                    url: 'https://postman-echo.com/get',
                    auth: { type: 'basic', basic: { username: 'a', password: 'b' } }
                }
            });
            folderWithAuth = new sdk.ItemGroup({
                name: 'folder2',
                auth: {
                    type: 'hawk',
                    hawk: { user: 'nobody' }
                }
            });
            folderWithEmptyAuth = new sdk.ItemGroup({
                name: 'folder3',
                auth: { type: null }
            });
            itemWithEmptyAuth = new sdk.Item({
                name: 'item2',
                request: {
                    url: 'https://postman-echo.com/get',
                    auth: { type: null }
                }
            });
        });

        afterEach(function () {
            collection = null;
            item = null;
            folder = null;
            itemWithAuth = null;
            folderWithAuth = null;
        });

        it('should lookup auth method from parent folder', function () {
            folderWithAuth.items.add(item);
            collection.items.add(folderWithAuth);

            var auth = item.getAuth().toJSON();

            expect(auth).to.eql({
                type: 'hawk',
                hawk: [{
                    key: 'user',
                    type: 'any',
                    value: 'nobody'
                }]
            });
        });

        it('should lookup auth method from collection, if absent in folder and item', function () {
            folder.items.add(item);
            collectionWithAuth.items.add(folder);

            var auth = item.getAuth().toJSON();

            expect(auth.basic).to.eql([{
                key: 'username',
                type: 'any',
                value: 'c'
            }, {
                key: 'password',
                type: 'any',
                value: 'd'
            }]);
        });


        it('should lookup auth method, if present in item', function () {
            folder.items.add(itemWithAuth);
            collectionWithAuth.items.add(folder);

            var auth = itemWithAuth.getAuth().toJSON();

            expect(auth.basic).to.eql([{
                key: 'username',
                type: 'any',
                value: 'a'
            }, {
                key: 'password',
                type: 'any',
                value: 'b'
            }]);
        });

        it('should return undefined if no auth is present', function () {
            folder.items.add(item);
            collection.items.add(folder);

            var auth = item.getAuth();

            expect(auth).to.be.undefined;
        });

        it('should handle parent lookup for empty but defined auth in item', function () {
            folder.items.add(itemWithEmptyAuth);
            collectionWithAuth.items.add(folder);

            var auth = itemWithEmptyAuth.getAuth().toJSON();

            expect(auth.basic).to.eql([{
                key: 'username',
                type: 'any',
                value: 'c'
            }, {
                key: 'password',
                type: 'any',
                value: 'd'
            }]);
        });

        it('should handle parent lookup for empty but defined auth in folder', function () {
            folderWithEmptyAuth.items.add(itemWithEmptyAuth);
            collectionWithAuth.items.add(folderWithEmptyAuth);

            var auth = itemWithEmptyAuth.getAuth().toJSON();

            expect(auth.basic).to.eql([{
                key: 'username',
                type: 'any',
                value: 'c'
            }, {
                key: 'password',
                type: 'any',
                value: 'd'
            }]);
        });
    });

    describe('.getEvents', function () {
        var item = new sdk.Item({
            name: '200 ok',
            request: 'http://echo.getpostman.com/status/200',
            event: [{
                listen: 'prerequest',
                script: 'my-global-script-1'
            }, {
                listen: 'test',
                script: {
                    type: 'text/javascript',
                    exec: 'console.log(\'hello\');'
                }
            }]
        });

        it('should return all events if no name/falsy name is provided', function () {
            var events = item.getEvents();

            expect(events).to.have.lengthOf(2);
            expect(events[0]).to.have.property('listen', 'prerequest');
            expect(events[1]).to.have.property('listen', 'test');
        });

        it('should filter down to the provided name', function () {
            var events = item.getEvents('test');

            expect(events).to.have.lengthOf(1);
            expect(events[0]).to.have.property('listen', 'test');
        });
    });

    describe('.authoriseRequestUsing', function () {
        it('should be able to set an authentication property using a specific type', function () {
            var item = new Item();

            item.authorizeRequestUsing('noauth', {
                foo: 'bar'
            });

            item.authorizeRequestUsing('basic', {
                username: 'foo',
                password: 'bar'
            });

            expect(item.request.auth.toJSON()).to.eql({
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

    describe('isItem', function () {
        var rawItem = fixtures.collectionV2.item[0];

        it('should return true for a Item instance', function () {
            expect(sdk.Item.isItem(new sdk.Item(rawItem))).to.be.true;
        });

        it('should return false for a raw Item object', function () {
            expect(sdk.Item.isItem(rawItem)).to.be.false;
        });

        it('should return false when called without arguments', function () {
            expect(sdk.Item.isItem()).to.be.false;
        });
    });

    describe('.setProtocolProfileBehavior', function () {
        it('should set protocolProfileBehavior on an Item', function () {
            var item = new Item();
            item.setProtocolProfileBehavior('key1', 'value')
                .setProtocolProfileBehavior('key2', true)
                .setProtocolProfileBehavior('key3', 123);

            expect(item.toJSON()).to.deep.include({
                protocolProfileBehavior: {
                    key1: 'value',
                    key2: true,
                    key3: 123
                }
            });
        });

        it('should update protocolProfileBehavior on an Item', function () {
            var item = new Item({
                protocolProfileBehavior: { keyName: 'initialValue' }
            });

            item.setProtocolProfileBehavior('keyName', 'updatedValue');
            expect(item.toJSON()).to.deep.include({
                protocolProfileBehavior: {
                    keyName: 'updatedValue'
                }
            });
        });

        it('should not set protocolProfileBehavior for non-string keys', function () {
            var item = new Item();

            item.setProtocolProfileBehavior(true);
            expect(item.toJSON()).to.not.have.property('protocolProfileBehavior');

            item.setProtocolProfileBehavior({}, 'value');
            expect(item.toJSON()).to.not.have.property('protocolProfileBehavior');

            item.setProtocolProfileBehavior(123, 'value');
            expect(item.toJSON()).to.not.have.property('protocolProfileBehavior');
        });
    });

    describe('unsetProtocolProfileBehavior', function () {
        it('should unset protocolProfileBehavior from an Item', function () {
            var item = new Item({
                protocolProfileBehavior: { keyName: 'value' }
            });

            item.unsetProtocolProfileBehavior('keyName');
            expect(item.toJSON()).to.have.property('protocolProfileBehavior').that.is.empty;
        });

        it('should not unset protocolProfileBehavior from an Item incase key is not of type string', function () {
            var item = new Item({
                protocolProfileBehavior: { keyName: null }
            });

            item.unsetProtocolProfileBehavior(null);
            expect(item.toJSON()).to.have.property('protocolProfileBehavior').that.is.not.empty;
        });

        it('should not unset protocolProfileBehavior from an Item incase key name is not valid', function () {
            var item = new Item({
                protocolProfileBehavior: { keyName: 'value' }
            });

            item.unsetProtocolProfileBehavior('keyName2');
            expect(item.toJSON()).to.have.property('protocolProfileBehavior').that.is.not.empty;
            expect(item.getProtocolProfileBehaviorResolved()).to.eql({
                keyName: 'value'
            });
        });
    });

    describe('.getProtocolProfileBehavior', function () {
        it('should get protocolProfileBehavior on an Item', function () {
            var item = new Item({
                protocolProfileBehavior: { key: 'value' }
            });

            expect(item.getProtocolProfileBehavior()).to.eql({ key: 'value' });
        });

        it('should not inherit protocolProfileBehavior from parent', function () {
            var itemGroup = new sdk.ItemGroup({
                    protocolProfileBehavior: { key: 'value' },
                    item: [{ name: 'I1' }]
                }),
                item = itemGroup.items.members[0];

            expect(sdk.Item.isItem(item)).to.be.true;
            expect(item.getProtocolProfileBehavior()).to.be.empty;
        });
    });

    describe('.getProtocolProfileBehaviorResolved', function () {
        it('should inherit protocolProfileBehavior from parent ItemGroup', function () {
            var itemGroup = new sdk.ItemGroup({
                    protocolProfileBehavior: { key: 'value', hello: 'world' },
                    item: [{
                        name: 'I1',
                        protocolProfileBehavior: { key: 'new-value' }
                    }]
                }),
                item = itemGroup.items.members[0];

            expect(sdk.Item.isItem(item)).to.be.true;
            expect(item.getProtocolProfileBehaviorResolved()).to.eql({
                hello: 'world',
                key: 'new-value'
            });
        });

        it('should inherit protocolProfileBehavior from collection', function () {
            var itemGroup = new sdk.Collection({
                    protocolProfileBehavior: { key: 'value', hello: 'world' },
                    item: [{
                        name: 'I1',
                        protocolProfileBehavior: { key: 'new-value' }
                    }]
                }),
                item = itemGroup.items.members[0];

            expect(sdk.Item.isItem(item)).to.be.true;
            expect(item.getProtocolProfileBehaviorResolved()).to.eql({
                hello: 'world',
                key: 'new-value'
            });
        });

        // Refer: https://github.com/postmanlabs/postman-app-support/issues/8293
        it('should not mutate the parent scope', function () {
            var itemGroup = new sdk.ItemGroup({
                    protocolProfileBehavior: { k0: 'v0' },
                    item: [{
                        name: 'I1',
                        protocolProfileBehavior: { k1: 'v1' }
                    }, {
                        name: 'I2',
                        protocolProfileBehavior: { k2: 'v2' }
                    }, {
                        name: 'I3',
                        protocolProfileBehavior: { k3: 'v3' }
                    }]
                }),
                items = itemGroup.items.members;

            expect(items[0].getProtocolProfileBehaviorResolved()).to.eql({ k0: 'v0', k1: 'v1' });
            expect(items[1].getProtocolProfileBehaviorResolved()).to.eql({ k0: 'v0', k2: 'v2' });
            expect(items[2].getProtocolProfileBehaviorResolved()).to.eql({ k0: 'v0', k3: 'v3' });
            expect(itemGroup.getProtocolProfileBehaviorResolved()).to.eql({ k0: 'v0' });
        });
    });
});
