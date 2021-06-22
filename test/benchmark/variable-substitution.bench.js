suite('SuperString variable substitution', function () {
    var SDK = require('../../'),
        fakerMap = require('../../lib/superstring/faker-map'),

        manyVarsFixture4 = Object.keys(fakerMap).filter((item, index) => { return index < 4; }).map((varname) => {
            return '{{$random' + varname + '}}';
        }).join(' '),

        manyVarsFixture8 = Object.keys(fakerMap).filter((item, index) => { return index < 8; }).map((varname) => {
            return '{{$random' + varname + '}}';
        }).join(' '),

        manyVarsFixture16 = Object.keys(fakerMap).filter((item, index) => { return index < 16; }).map((varname) => {
            return '{{$random' + varname + '}}';
        }).join(' '),

        manyVarsFixture32 = Object.keys(fakerMap).filter((item, index) => { return index < 32; }).map((varname) => {
            return '{{$random' + varname + '}}';
        }).join(' '),

        manyVarsFixture64 = Object.keys(fakerMap).filter((item, index) => { return index < 64; }).map((varname) => {
            return '{{$random' + varname + '}}';
        }).join(' ');

    scenario('single constant dynamic variable', () => {
        SDK.Property.replaceSubstitutions('{{$randomName}}');
    });

    scenario('two constant dynamic variables', () => {
        SDK.Property.replaceSubstitutions('{{$randomName}} has transferred {{$randomBitcoin}} bitcoin');
    });

    scenario('four constant dynamic variables', () => {
        // eslint-disable-next-line max-len
        SDK.Property.replaceSubstitutions(manyVarsFixture4);
    });

    scenario('eight constant dynamic variables', () => {
        // eslint-disable-next-line max-len
        SDK.Property.replaceSubstitutions(manyVarsFixture8);
    });

    scenario('sixteen constant dynamic variables', () => {
        SDK.Property.replaceSubstitutions(manyVarsFixture16);
    });

    scenario('thirty-two constant dynamic variables', () => {
        SDK.Property.replaceSubstitutions(manyVarsFixture32);
    });

    scenario('sixty-four constant dynamic variables', () => {
        SDK.Property.replaceSubstitutions(manyVarsFixture64);
    });
});
