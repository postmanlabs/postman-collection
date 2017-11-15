var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    sdk = require('../../lib/index.js'),

    Request = require('../../lib/index.js').Request,
    Item = require('../../lib/index.js').Item;

/* global describe, it */
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
                    response: []
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
                expect(item).to.be.ok();
            });

            describe('has property', function () {
                it('description', function () {
                    expect(item).to.have.property('description');
                    expect(item.description).to.be.an('object');
                });

                it('events', function () {
                    expect(item).to.have.property('events');
                    expect(item.events.all()).to.be.an('array');
                    expect(item.events.all()).to.not.be.empty();
                });

                it('id', function () {
                    expect(item).to.have.property('id', rawItem.id);
                });

                it('name', function () {
                    expect(item).to.have.property('name', rawItem.name);
                });

                it('request', function () {
                    expect(item).to.have.property('request');
                    expect(item.request).to.be.an('object');
                    expect(item.request).to.not.be.empty();
                });

                it('responses', function () {
                    expect(item).to.have.property('responses');
                    expect(item.responses.all()).to.be.an('array');
                    expect(item.responses.all()).to.not.be.empty();
                });
            });
        });

        describe('folder', function () {
            var rawItem = fixtures.collectionV2.item[2],
                item = new Item(rawItem);

            it('initializes successfully', function () {
                expect(item).to.be.ok();
            });

            describe('has property', function () {
                it('id', function () {
                    expect(item).to.have.property('id', rawItem.id);
                });

                it('name', function () {
                    expect(item).to.have.property('name', rawItem.name);
                });

                it('request', function () {
                    expect(item).to.have.property('request');
                    expect(item.request).to.be.a(Request);
                });
            });
        });
    });

    describe('json representation', function () {
        it('must match what the item was initialized with', function () {
            var jsonified = item.toJSON();

            expect(jsonified.id).to.eql(rawItem.id);

            // All of these have their own proper tests
            expect(jsonified).to.have.property('description');
            expect(jsonified).to.have.property('request');
            expect(jsonified).to.have.property('response');
            expect(jsonified).to.have.property('event');
        });
    });

    describe('.parent', function () {
        var collection = new sdk.Collection(fixtures.nestedCollectionV2);

        it('must return a falsy result for a standalone item', function () {
            expect(item.parent()).to.not.be.ok();
        });

        it('must work correctly for a nested item', function () {
            var nestedItem = collection.items.members[1].items.members[0].items.members[0],
                parent = nestedItem.parent();

            expect(parent.name).to.be('F2.F3');
        });

        it('must work correctly for a regular folder item', function () {
            var f1 = collection.items.members[0],
                r1 = f1.items.members[0],
                parent = r1.parent();

            expect(parent.name).to.be(f1.name);
        });

        it('must work correctly for a first level item', function () {
            var firstLevelItem = collection.items.members[2], // root level request R1
                parent = firstLevelItem.parent();

            expect(parent.name).to.be(collection.name);
        });
    });

    describe('.getAuth()', function () {
        var item,
            folder,
            collection,
            itemWithAuth,
            folderWithAuth,
            collectionWithAuth;

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

            expect(auth).to.be(undefined);
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

            expect(events).to.have.length(2);
            expect(events[0]).to.have.property('listen', 'prerequest');
            expect(events[1]).to.have.property('listen', 'test');
        });

        it('should filter down to the provided name', function () {
            var events = item.getEvents('test');

            expect(events).to.have.length(1);
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
            expect(sdk.Item.isItem(new sdk.Item(rawItem))).to.be(true);
        });

        it('should return false for a raw Item object', function () {
            expect(sdk.Item.isItem(rawItem)).to.be(false);
        });

        it('should return false when called without arguments', function () {
            expect(sdk.Item.isItem()).to.be(false);
        });
    });
});
