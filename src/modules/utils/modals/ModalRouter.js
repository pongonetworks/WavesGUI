(function () {
    'use strict';

    /**
     * @param {User} user
     * @param {ModalManager} modalManager
     * @param {Waves} waves
     * @param {Router} router
     * @param {$rootScope.Scope} $rootScope
     * @param {app.utils} utils
     * @return {ModalRouter}
     */
    const factory = function (user, modalManager, waves, router, $rootScope, utils) {

        class ModalRouter {


            constructor() {
                /**
                 * @type {boolean}
                 * @private
                 */
                this._sleep = false;
                /**
                 * @type {{url: string, search: string}}
                 * @private
                 */
                this._firstUrl = ModalRouter._getUrlData();
                router.registerRouteHash(this._wrapClose(this._getRoutes()));

                if (WavesApp.isDesktop()) {
                    window.listenMainProcessEvent((eventType, urlString) => {
                        user.onLogin().then(() => {
                            const { hash } = utils.parseElectronUrl(urlString);
                            if (hash) {
                                this._apply(ModalRouter._getUrlData(hash.replace('#', '')));
                            }
                        });
                    });
                }
            }

            initialize() {
                window.addEventListener('hashchange', () => {
                    if (!this._sleep) {
                        this._apply(ModalRouter._getUrlData());
                    }
                }, false);

                waves.node.assets.userBalances().then(() => {
                    this._apply(this._firstUrl);
                });
            }

            /**
             * @private
             */
            _apply({ url, search }) {
                return router.apply(url, utils.parseSearchParams(search));
            }

            /**
             * @return {Object.<function>}
             * @private
             */
            _getRoutes() {
                return {
                    '/send': () => modalManager.showSendAsset(),
                    '/send/:assetId': ({ assetId }, search) => {
                        return modalManager.showSendAsset({ ...search, assetId });
                    },
                    '/asset/:assetId': ({ assetId }) => {
                        return waves.node.assets.getAsset(assetId).then((asset) => {
                            return modalManager.showAssetInfo(asset);
                        });
                    },
                    // '/receive': () => modalManager.showReceiveAsset(user), // TODO : decide on that
                    '/account': () => modalManager.showAccountInfo(),
                    '/gateway/auth': (params, search) => modalManager.showGatewaySign(search)
                };
            }

            /**
             * @param hash
             * @returns {*}
             * @private
             */
            _wrapClose(hash) {
                Object.keys(hash).forEach((key) => {
                    const handler = hash[key];
                    hash[key] = (...args) => {
                        this._sleep = true;
                        return user.onLogin().then(() => {
                            const result = handler(...args);
                            if (!result || !result.then || typeof result.then !== 'function') {
                                throw new Error('Modal result mast be a promise!');
                            }
                            const cb = () => {
                                this._sleep = false;
                                location.hash = '';
                            };
                            result.then(cb, cb);
                            return result;
                        });
                    };
                });
                return hash;
            }

            /**
             * @param {string} [fromUrl]
             * @return {{url: string, search: string}}
             * @private
             */
            static _getUrlData(fromUrl) {
                const fullUrl = `/${decodeURIComponent(fromUrl || ModalRouter._getLocation())}`;
                const [url, search] = fullUrl.split('?');
                return { url, search };
            }

            static _getLocation() {
                if (WavesApp.isDesktop()) {
                    const lastIndex = location.hash.lastIndexOf('#');
                    const firstIndex = location.hash.indexOf('#');
                    return lastIndex > firstIndex ? location.hash.slice(lastIndex + 1) : '';
                } else {
                    return location.hash.replace('#', '');
                }
            }

        }

        return ModalRouter;
    };

    factory.$inject = ['user', 'modalManager', 'waves', 'router', '$rootScope', 'utils'];

    angular.module('app.ui').factory('ModalRouter', factory);
})();
