var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Request = require('../../lib/index.js').Request,
    Item = require('../../lib/index.js').Item;

/* global describe, it */
describe('Item', function () {
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
