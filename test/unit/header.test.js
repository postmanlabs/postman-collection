var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    Header = require('../../lib/index.js').Header,
    PropertyList = require('../../lib/index.js').PropertyList;

/* global describe, it */
describe('Header', function () {
    describe('sanity', function () {
        var rawHeaders = fixtures.collectionV2.item[0].response[0].header,
            headers = (new PropertyList(Header, undefined, rawHeaders)).all();

        it('initialize successfully', function () {
            expect(headers).to.be.ok();
            expect(headers).to.be.an('array');
        });

        describe('each contain property', function () {
            var header = headers[0];

            it('key', function () {
                expect(header).to.have.property('key', 'Content-Type');
            });

            it('value', function () {
                expect(header).to.have.property('value', 'application/json');
            });
        });
    });

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

        it('should strip whitespace and return the header', function () {
            expect(Header.parseSingle('\tDate: Mon, 25 Jul 2016 13:11:41 GMT\n\n')).to.eql({
                key: 'Date',
                value: 'Mon, 25 Jul 2016 13:11:41 GMT'
            });
        });
    });

    describe('unparse', function () {
        it('should unparse headers to a blank string for invalid inputs', function () {
            expect(Header.unparse('')).to.be('');
            expect(Header.unparse({ key: 'foo', value: 'bar' })).to.be('');

            expect(Header.unparseSingle('')).to.be('');
        });

        it('should unparse headers to a string', function () {
            var raw = 'name1: value1\r\nname2: value2',
                list = new PropertyList(Header, {}, raw);
            expect(list.all()).to.eql([{
                key: 'name1',
                value: 'value1'
            }, {
                key: 'name2',
                value: 'value2'
            }]);
            expect(Header.unparse(list)).to.be('name1: value1\nname2: value2');
        });

        it('should honor the given separator "\\r\\n"', function () {
            var raw = 'name1: value1\r\nname2: value2',
                list = new PropertyList(Header, {}, raw);
            expect(list.all()).to.eql([{
                key: 'name1',
                value: 'value1'
            }, {
                key: 'name2',
                value: 'value2'
            }]);
            expect(Header.unparse(list, '\r\n')).to.be(raw);
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

        // @todo - this is not supported yet, unskip this test when this method of header construction is supported
        it.skip('must load a plain header key:value object, with values being an array', function () {
            var list = new PropertyList(Header, {}, {
                name1: ['value1', 'value2'],
                name2: 'value3'
            });
            expect(list.all()).to.eql([{
                key: 'name1',
                value: 'value1'
            }, {
                key: 'name1',
                value: 'value2'
            }, {
                key: 'name2',
                value: 'value3'
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

    describe('isHeader', function () {
        // eslint-disable-next-line max-len
        var rawHeader = 'Content-Type: application/json\nAuthorization: Hawk id="dh37fgj492je", ts="1448549987", nonce="eOJZCd", mac="O2TFlvAlMvKVSKOzc6XkfU6+5285k5p3m5dAjxumo2k="\n';

        it('should return true for a Header instance', function () {
            expect(Header.isHeader(new Header(rawHeader))).to.be(true);
        });

        it('should return false for a raw Header object', function () {
            expect(Header.isHeader(rawHeader)).to.be(false);
        });

        it('should return false when called without arguments', function () {
            expect(Header.isHeader()).to.be(false);
        });
    });
});
