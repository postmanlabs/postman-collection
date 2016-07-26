var expect = require('expect.js'),
    Header = require('../../lib/index.js').Header,
    PropertyList = require('../../lib/index.js').PropertyList;

/* global describe, it */
describe('Header', function () {
    it('must have a .create to create new instamce', function () {
        expect(Header.create('Mon, 25 Jul 2016 13:11:41 GMT', 'Date')).to.eql({
            key: 'Date',
            value: 'Mon, 25 Jul 2016 13:11:41 GMT'
        });
        expect(Header.create('value', 'name')).to.eql({
            key: 'name',
            value: 'value'
        });
        expect(Header.create('name:value')).to.eql({
            key: 'name',
            value: 'value'
        });
        expect(Header.create({ key: 'name', value: 'value' })).to.eql({
            key: 'name',
            value: 'value'
        });
        expect(Header.create('name: my: value:is this')).to.eql({
            key: 'name',
            value: 'my: value:is this'
        });
    });

    describe('parseSingle', function () {
        it('should return an empty header on invalid input', function () {
            expect(Header.parseSingle({})).to.eql({
                key: '',
                value: ''
            });
        });

        it('should create an empty header on invalid input', function () {
            expect(Header.parseSingle('novalue')).to.eql({
                key: 'novalue',
                value: ''
            });
        });

        it('should string whitespace and return the header', function () {
            expect(Header.parseSingle('\tDate: Mon, 25 Jul 2016 13:11:41 GMT\n\n')).to.eql({
                key: 'Date',
                value: 'Mon, 25 Jul 2016 13:11:41 GMT'
            });
        });
    });

    describe('inside PropertyList', function () {
        it('must load a header string', function () {
            var list = new PropertyList(Header, {}, 'name1:value1\r\nname2:value2');
            expect(list.all()).to.eql([{
                key: 'name1',
                value: 'value1'
            }, {
                key: 'name2',
                value: 'value2'
            }]);
        });
        it('must load an array of strings', function () {
            var list = new PropertyList(Header, {}, ['name1:value1', 'name2:value2']);
            expect(list.all()).to.eql([{
                key: 'name1',
                value: 'value1'
            }, {
                key: 'name2',
                value: 'value2'
            }]);
        });
        it('must load an array of objects', function () {
            var list = new PropertyList(Header, {}, [{
                key: 'name1',
                value: 'value1'
            }, {
                key: 'name2',
                value: 'value2'
            }]);
            expect(list.all()).to.eql([{
                key: 'name1',
                value: 'value1'
            }, {
                key: 'name2',
                value: 'value2'
            }]);
        });
        it('must load a plain header key:value object', function () {
            var list = new PropertyList(Header, {}, {
                name1: 'value1',
                name2: 'value2'
            });
            expect(list.all()).to.eql([{
                key: 'name1',
                value: 'value1'
            }, {
                key: 'name2',
                value: 'value2'
            }]);
        });
        it('must load headers with empty values', function () {
            var list = new PropertyList(Header, {}, {
                name1: 'value1',
                name2: ''
            });
            expect(list.all()).to.eql([{
                key: 'name1',
                value: 'value1'
            }, {
                key: 'name2',
                value: ''
            }]);
        });
    });
});
