import * as apiMethods from './api/API';
import { DataManager } from './classes/DataManager';
import * as configApi from './config';
import * as sign from './sign';
import * as utilsModule from './utils/utils';
import { request } from './utils/request';
import { IFetchOptions } from './utils/request';
import * as wavesDataEntitiesModule from '@waves/data-entities';
import { BigNumber, Asset, Money, AssetPair, OrderPrice } from '@waves/data-entities';
import { normalizeTime, toAsset, toBigNumber } from './utils/utils';
import { IAssetInfo } from '@waves/data-entities/dist/entities/Asset';
import { get } from './config';
import { TAssetData, TBigNumberData } from './interface';
import { get as getAssetPair } from './api/pairs/pairs';
import {
    prepareForBroadcast as prepareForBroadcastF,
    getTransactionId as getTransactionIdF,
    broadcast as broadcastF,
    createOrder as createOrderF,
    cancelOrder as cancelOrderF
} from './broadcast/broadcast';
import { utils as cryptoUtils } from '@turtlenetwork/tn-signature-generator';

export { Seed } from './classes/Seed';

export const wavesDataEntities = {
    ...wavesDataEntitiesModule
};
export const api = { ...apiMethods };
export const dataManager = new DataManager();
export const config = { ...configApi };
export const utils = { ...utilsModule };
export const signature = {
    ...sign
};
export const isValidAddress = cryptoUtils.crypto.isValidAddress;

export const prepareForBroadcast = prepareForBroadcastF;
export const getTransactionId = getTransactionIdF;
export const broadcast = broadcastF;
export const createOrder = createOrderF;
export const cancelOrder = cancelOrderF;

wavesDataEntitiesModule.config.set('remapAsset', (data: IAssetInfo) => {
    const name = get('remappedAssetNames')[data.id] || data.name;
    return { ...data, name };
});

export function fetch<T>(url: string, fetchOptions: IFetchOptions): Promise<T> {
    return request<T>({ url, fetchOptions });
}

export function moneyFromTokens(tokens: TBigNumberData, assetData: TAssetData): Promise<Money> {
    return toAsset(assetData).then((asset) => {
        return wavesDataEntities.Money.fromTokens(tokens, asset);
    });
}

export function moneyFromCoins(coins: TBigNumberData, assetData: TAssetData): Promise<Money> {
    return toAsset(assetData).then((asset) => new Money(coins, asset));
}

export function orderPriceFromCoins(coins: TBigNumberData, pair: AssetPair): Promise<OrderPrice>;
export function orderPriceFromCoins(coins: TBigNumberData, asset1: TAssetData, asset2: TAssetData): Promise<OrderPrice>;
export function orderPriceFromCoins(coins: TBigNumberData, pair: AssetPair | TAssetData, asset2?: TAssetData): Promise<OrderPrice> {
    if (pair instanceof AssetPair) {
        return Promise.resolve(OrderPrice.fromMatcherCoins(coins, pair));
    } else {
        return getAssetPair(pair, asset2).then((pair) => OrderPrice.fromMatcherCoins(coins, pair));
    }
}

export function orderPriceFromTokens(tokens: TBigNumberData, pair: AssetPair): Promise<OrderPrice>;
export function orderPriceFromTokens(tokens: TBigNumberData, asset1: TAssetData, asset2: TAssetData): Promise<OrderPrice>;
export function orderPriceFromTokens(tokens: TBigNumberData, pair: AssetPair | TAssetData, asset2?: TAssetData): Promise<OrderPrice> {
    if (pair instanceof AssetPair) {
        return Promise.resolve(OrderPrice.fromTokens(tokens, pair));
    } else {
        return getAssetPair(pair, asset2).then((pair) => OrderPrice.fromTokens(tokens, pair));
    }
}

class App {

    public address: string;

    public login(address: string, api: sign.ISignatureApi): Promise<void> {
        this.address = address;
        sign.setSignatureApi(api);
        return this._addMatcherSign()
            .then(() => this._initializeDataManager(address));
    }

    public logOut() {
        sign.dropSignatureApi();
        dataManager.dropAddress();
    }

    private _addMatcherSign() {
        const timestamp = utilsModule.addTime(normalizeTime(new Date().getTime()), 2, 'hour').valueOf();
        return sign.getSignatureApi().getPublicKey()
            .then((senderPublicKey) => {
                return sign.getSignatureApi().sign({
                    type: sign.SIGN_TYPE.MATCHER_ORDERS,
                    data: {
                        senderPublicKey,
                        timestamp
                    }
                })
                    .then((signature) => {
                        api.matcher.addSignature(signature, senderPublicKey, timestamp);
                    });
            });
    }

    private _initializeDataManager(address: string): void {
        dataManager.applyAddress(address);
    }

}

export const app = new App();
