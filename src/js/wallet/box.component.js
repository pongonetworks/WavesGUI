(function () {
    'use strict';

    function WalletBoxController() {
        var ctrl = this;

        var mapping = {};
        mapping[Currency.TN.displayName] = {
            image: 'logo_Turtle.svg',
            displayName: Currency.TN.displayName,
            gatewayAddr: 'https://gateway.blackturtle.eu'
        };
        mapping[Currency.LTC.displayName] = {
            image: 'wB-bg-LTC.svg',
            displayName: Currency.LTC.displayName,
            gatewayAddr: 'https://litecoingw.blackturtle.eu'
        };
        mapping[Currency.BTC.displayName] = {
            image: 'wB-bg-BTC.svg',
            displayName: Currency.BTC.displayName,
            gatewayAddr: 'https://bitcoingw.blackturtle.eu'
        };
        mapping[Currency.WAVES.displayName] = {
            image: 'wB-bg-WAV.svg',
            displayName: Currency.WAVES.displayName,
            gatewayAddr: 'https://wavesgateway.blackturtle.eu'
        };
        mapping[Currency.DASH.displayName] = {
            image: 'wB-bg-WAV.svg',
            displayName: Currency.DASH.displayName,
            gatewayAddr: 'https://dashgw.blackturtle.eu'
        };
        mapping[Currency.WGR.displayName] = {
            image: 'wB-bg-WGR.png',
            displayName: Currency.WGR.displayName,
            gatewayAddr: 'https://wagerrgw.blackturtle.eu'
        };

        ctrl.$onChanges = function (changesObject) {
            if (changesObject.balance) {
                var balance = changesObject.balance.currentValue;
                ctrl.integerBalance = balance.formatIntegerPart();
                ctrl.fractionBalance = balance.formatFractionPart();
            }
        };
        ctrl.$onInit = function () {
            ctrl.image = mapping[ctrl.balance.currency.displayName].image;
            ctrl.displayName = mapping[ctrl.balance.currency.displayName].displayName;
            ctrl.gatewayAddr = mapping[ctrl.balance.currency.displayName].gatewayAddr;
        };
    }

    WalletBoxController.$inject = [];

    angular
        .module('app.wallet')
        .component('walletBox', {
            controller: WalletBoxController,
            bindings: {
                balance: '<',
                onSend: '&',
                onWithdraw: '&',
                onDeposit: '&',
                detailsAvailable: '<?'
            },
            templateUrl: 'wallet/box.component'
        });
})();
