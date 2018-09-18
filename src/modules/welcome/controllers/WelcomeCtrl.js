(function () {
    'use strict';

    const PATH = 'modules/welcome/templates';
    const { Seed } = require('data-service');

    /**
     * @param Base
     * @param $scope
     * @param $state
     * @param user
     * @param modalManager
     * @param $element
     * @param storage
     * @param {app.utils} utils
     * @return {WelcomeCtrl}
     */
    const controller = function (Base, $scope, $state, user, modalManager, $element, storage, utils) {

        class WelcomeCtrl extends Base {

            get user() {
                return this.userList[this._activeUserIndex];
            }

            get encryptedSeed() {
                return this.user.encryptedSeed;
            }

            constructor() {
                super($scope);
                /**
                 * @type {string}
                 */
                this.password = '';
                /**
                 * @type {null}
                 */
                this.loginForm = null;
                /**
                 * @type {string}
                 */
                this.activeUserAddress = null;
                /**
                 * @type {number}
                 * @private
                 */
                this._activeUserIndex = null;

                this.observe('activeUserAddress', this._calculateActiveIndex);

                if (WavesApp.isWeb()) {
                    storage.load('accountImportComplete')
                        .then((complete) => {
                            if (complete) {
                                this._initUserList();
                            } else {
                                this._loadUserListFromBeta();
                            }
                        });
                } else {
                    this._initUserList();
                }
            }

            showTutorialModals() {
                return modalManager.showTutorialModals();
            }

            login() {
                try {
                    this.showPasswordError = false;
                    const activeUser = this.user;
                    const encryptionRounds = user.getSettingByUser(activeUser, 'encryptionRounds');
                    const phrase = Seed.decryptSeedPhrase(this.encryptedSeed, this.password, encryptionRounds);
                    const seed = new Seed(phrase);
                    const keyPair = seed.keyPair;

                    if (seed.address === activeUser.address) {
                        user.login({
                            address: activeUser.address,
                            api: ds.signature.getDefaultSignatureApi(keyPair, activeUser.address, phrase),
                            password: this.password,
                            publicKey: seed.keyPair.publicKey
                        });
                    } else {
                        this._showPasswordError();
                    }
                } catch (e) {
                    this._showPasswordError();
                }
            }

            /**
             * @param {string} address
             */
            removeUser(address) {
                const user = this.userList.find((user) => user.address === address);
                modalManager.showConfirmDeleteUser(user.settings.hasBackup).then(() => {
                    this._deleteUser(address);
                });
            }

            /**
             * @private
             */
            _showPasswordError() {
                this.password = '';
                this.showPasswordError = true;
            }

            /**
             * @private
             */
            _deleteUser(address) {
                user.removeUserByAddress(address);
                this.userList = this.userList.filter((user) => user.address !== address);
                this._updateActiveUserAddress();
            }

            _initUserList() {
                user.getUserList()
                    .then((list) => {
                        this.userList = list;
                        this.pendingRestore = false;
                        this._updateActiveUserAddress();
                        setTimeout(() => {
                            $scope.$apply(); // TODO FIX!
                        }, 100);
                    });
            }

            _loadUserListFromBeta() {
                this.pendingRestore = true;
                utils.importAccountByIframe(WavesApp.betaOrigin, 5000)
                    .then((userList) => {
                        this.userList = userList || [];
                        this.pendingRestore = false;
                        this._updateActiveUserAddress();

                        $scope.$apply();

                        storage.save('accountImportComplete', true);
                        storage.save('userList', userList);
                    })
                    .catch(() => {
                        storage.save('accountImportComplete', true);
                        this._initUserList();
                    });
            }

            /**
             * @private
             */
            _updateActiveUserAddress() {
                if (this.userList.length) {
                    this.activeUserAddress = this.userList[0].address;
                } else {
                    this.activeUserAddress = null;
                }
                this._updatePageUrl();
            }

            /**
             * @private
             */
            _updatePageUrl() {
                if (this.userList.length) {
                    this.pageUrl = `${PATH}/userList.html`;
                } else {
                    this.pageUrl = `${PATH}/welcomeNewUser.html`;
                }
            }

            /**
             * @private
             */
            _calculateActiveIndex() {
                const activeAddress = this.activeUserAddress;
                let index = null;

                if (!activeAddress) {
                    return null;
                }

                this.userList.some(({ address }, i) => {
                    if (address === activeAddress) {
                        index = i;
                        return true;
                    }
                    return false;
                });

                this._activeUserIndex = index;
            }

        }

        return new WelcomeCtrl();
    };

    controller.$inject = ['Base', '$scope', '$state', 'user', 'modalManager', '$element', 'storage', 'utils'];

    angular.module('app.welcome')
        .controller('WelcomeCtrl', controller);
})();
