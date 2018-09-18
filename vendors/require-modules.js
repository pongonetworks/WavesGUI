(function () {
    'use strict';

    var MODULES_MAP = {
        'ts-utils': 'tsUtils',
        'bignumber.js': 'BigNumber',
        'ts-api-validator': 'tsApiValidator',
        'parse-json-bignumber': 'parseJsonBignumber',
        'papaparse': 'Papa',
        'waves-api': 'WavesAPI',
        'identity-img': 'identityImg',
        '@waves/data-entities': 'ds.wavesDataEntities',
        '@turtlenetwork/tn-signature-generator': 'wavesSignatureGenerator',
        'ramda': 'R',
        'data-service': 'ds',
        'handlebars': 'Handlebars',
        '@waves/waves-browser-bus': 'bus',
        'worker-wrapper': 'workerWrapper'
    };

    function getModule(require) {
        return function (name) {
            if (name in MODULES_MAP && MODULES_MAP.hasOwnProperty(name)) {
                return tsUtils.get(window, MODULES_MAP[name]);
            } else if (require) {
                return require(name);
            } else {
                throw new Error('Not loaded module with name "' + name);
            }
        };
    }

    window.require = getModule(window.require);
})();
