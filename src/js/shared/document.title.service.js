(function () {
    'use strict';

    var prefix = 'TurtleNetwork fork client';

    angular
        .module('app.shared')
        .service('documentTitleService', [function () {
            this.set = function (title) {
                document.title = prefix + (title ? ' | ' + title : '');
            };
        }]);
})();
