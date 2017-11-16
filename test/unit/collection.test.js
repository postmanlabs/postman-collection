var expect = require('expect.js'),
    Collection = require('../../lib/index.js').Collection,

    fixtures = require('../fixtures');

/* global describe, it */
describe('Collection', function () {
    describe('sanity', function () {
        var rawCollection = fixtures.collectionV2,
            collection = new Collection(rawCollection);

        it('initializes successfully', function () {
            expect(collection).to.be.ok();
        });

        describe('has property', function () {
            it('id', function () {
                expect(collection).to.have.property('id', rawCollection.info.id);
            });

            it('items', function () {
                expect(collection).to.have.property('items');
                expect(collection.items).to.be.an('object');
                expect(collection.items.all()).to.be.an('array');
                expect(collection.items.all()).to.not.be.empty();
            });

            it('name', function () {
                expect(collection).to.have.property('name', rawCollection.info.name);
            });

            it('events', function () {
                expect(collection).to.have.property('events');
                expect(collection.events.all()).to.be.an('array');
                expect(collection.events.all()).to.not.be.empty();
            });
        });

        describe('has function', function () {
            it('forEachItem', function () {
                expect(collection.forEachItem).to.be.a('function');
            });
        });

        describe('info block parsing', function () {
            it('must parse description', function () {
                var collection = new Collection({
                    info: {
                        name: 'test',
                        description: 'this is test description'
                    }
                });

                expect(collection.description).be.ok();
                expect(collection.description.toString()).be('this is test description');
            });

            it('must parse description from outside info block if info is absent', function () {
                var collection = new Collection({
                    name: 'test',
                    description: 'this is test description'
                });

                expect(collection.description).be.ok();
                expect(collection.description.toString()).be('this is test description');
            });
        });
    });

    describe('isCollection', function () {
        it('must distinguish between collections and other objects', function () {
            var collection = new Collection(),
                nonCollection = {};

            expect(Collection.isCollection(collection)).to.be(true);
            expect(Collection.isCollection()).to.be(false);
            expect(Collection.isCollection(nonCollection)).to.be(false);
        });
    });

    describe('variables', function () {
        it('must be able to sync variables from an object', function () {
            var collection = new Collection();

            collection.syncVariablesFrom({
                var1: 'value1'
            });

            expect(collection.variables.count()).be(1);
            expect(collection.variables.one('var1')).be.ok();
            expect(collection.variables.one('var1').value).be('value1');
        });

        it('must be able to sync variables to a target object', function () {
            var collection = new Collection({
                    variable: [{
                        key: 'var1',
                        value: '1',
                        type: 'number'
                    }]
                }),
                target = {
                    extra: true
                };

            collection.syncVariablesTo(target);

            expect(target).have.property('var1', 1);
            expect(target).not.have.property('extra');
        });
    });

    describe('events', function () {
        it('should allow adding events with a multitude of script definition format', function () {
            var collection = new Collection(),
                collectionJSON;

            collection.events.add({
                listen: 'test',
                script: {
                    id: 'test-script-1',
                    type: 'text/javascript',
                    exec: ['console.log("Random");']
                }
            });
            collection.events.add({
                listen: 'prerequest',
                script: ['console.log("A little less random");']
            });

            collectionJSON = collection.toJSON();

            expect(collectionJSON.event[0]).to.eql({
                listen: 'test',
                script: {
                    id: 'test-script-1',
                    type: 'text/javascript',
                    exec: ['console.log("Random");']
                }
            });
            expect(collectionJSON.event[1]).to.have.property('listen', 'prerequest');
            expect(collectionJSON.event[1]).to.have.property('script');
            expect(collectionJSON.event[1].script).to.have.property('id');
            expect(collectionJSON.event[1].script).to.have.property('type', 'text/javascript');
            expect(collectionJSON.event[1].script.exec).to.eql(['console.log("A little less random");']);
        });
    });

    describe('.toJSON', function () {
        it('should handle all required properties', function () {
            var collectionDefinition = {
                    info: {
                        id: 'my-collection',
                        name: 'Yay Collection!',
                        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                        version: '2.1.0'
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
                    },
                    event: [{
                        listen: 'test',
                        script: {
                            id: 'my-script-1',
                            type: 'text/javascript',
                            exec: [
                                'console.log("bcoz I am batman!");'
                            ]
                        }
                    }],
                    item: [{
                        event: [],
                        id: 'my-item-1',
                        request: {
                            method: 'GET',
                            url: {
                                host: ['postman-echo', 'com'],
                                path: ['get'],
                                protocol: 'https',
                                query: [],
                                variable: []
                            }
                        },
                        response: []
                    }],
                    variable: [{
                        key: 'foo',
                        value: 'bar',
                        type: 'string'
                    }]
                },
                collection = new Collection(collectionDefinition),
                collectionJSON = collection.toJSON();

            // version info does not exactly have a one to one mapping
            // with the definition and toJSON, hence the hack
            expect(collectionJSON.info.version).to.have.property('string', '2.1.0');
            delete collectionJSON.info.version;
            delete collectionDefinition.info.version;

            expect(collectionJSON).to.eql(collectionDefinition);

            // check for root level properties moved to info
            expect(collectionJSON).to.not.have.property('id');
            expect(collectionJSON).to.not.have.property('version');
            expect(collectionJSON).to.not.have.property('name');
        });
    });
});
