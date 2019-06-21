const axios = require('axios');
const qs = require('querystring');
const crypto = require('crypto');
const API_HOST = 'https://www.mercadobitcoin.net'
const API_PATH = '/tapi/v3/'
const API_URL = API_HOST + API_PATH;


class MercadoBitcoinApi {
  constructor(apiId, apiSecret) {
    this.apiId = apiId;
    this.apiSecret = apiSecret;
    this.axios = axios;
    this.axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  getQueryString(params) {
    return qs.stringify(Object.assign(params, { tapi_nonce: this.getTapiNonce() }))
  }

  getTapiNonce() {
    return Math.round(new Date().getTime() / 1000);
  }

  generateTapMac(querystring) {
    return crypto.createHmac('sha512', this.apiSecret)
      .update(API_PATH + '?' + querystring)
      .digest('hex');
  }

  call(params) {
    let queryString = this.getQueryString(params);
    let options = {
      url: API_URL,
      method: 'POST',
      headers: { 'TAPI-ID': this.apiId, 'TAPI-MAC': this.generateTapMac(queryString) },
      data: queryString,
    }
    return this.axios(options)
  }

  listSystemMessages() {
    return this.call({ tapi_method: 'list_system_messages' })
  }

  getAcountInfo() {
    return this.call({ tapi_method: 'get_account_info' });
  }

  getOrder(coinPair, orderId) {
    return this.call(
      {
        tapi_method: 'get_order',
        coin_pair: coinPair,
        order_id: orderId
      }
    )
  }

  listOrders(coinPair, params = {}) {
    let defaultParams = {
      tapi_method: 'list_orders',
      coin_pair: coinPair,
    }
    return this.call({ ...defaultParams, ...params })
  }

  listOrderbook(coinPair, full = false) {
    return this.call(
      {
        tapi_method: 'list_orderbook',
        coin_pair: coinPair,
        full: full
      }
    )
  }

  placeBuyOrder(coinPair, quantity, limitPrice) {
    return this.call(
      {
        tapi_method: 'place_buy_order',
        coin_pair: coinPair,
        quantity: quantity,
        limit_price: limitPrice
      }
    )
  }

  placeSellOrder(coinPair, quantity, limitPrice) {
    return this.call(
      {
        tapi_method: 'place_sell_order',
        coin_pair: coinPair,
        quantity: quantity,
        limit_price: limitPrice
      }
    )
  }

  placeMarketBuyOrder(coinPair, cost) {
    return this.call(
      {
        tapi_method: 'place_market_buy_order',
        coin_pair: coinPair,
        cost: cost
      }
    )
  }

  placeMarketSelOrder(coinPair, quantity) {
    return this.call(
      {
        tapi_method: 'place_market_sell_order',
        coin_pair: coinPair,
        quantity: quantity
      }
    )
  }

  cancelOrder(coinPair, orderId) {
    return this.call({
      tapi_method: 'cancel_order',
      coin_pair: coinPair,
      order_id: orderId
    })
  }

  getWithdrawal(coin, withDrawalId) {
    return this.call({
      tapi_method: 'get_withdrawal',
      coin: coin,
      withdrawal_id: withDrawalId
    })
  }

  withdrawCoinBrl(coin, description, quantity, accountRef) {
    return this.call({
      coin: coin,
      description: description,
      quantity: quantity,
      accountRef: accountRef
    })
  }

  withdrawCoinCryptoCurrency(coin, description, address, quantity, txFee, options = {}) {
    let params = {
      coin: coin,
      description: description,
      address: address,
      quantity: quantity,
      tx_fee: txFee,
      ...options
    }
    return this.call(params)
  }
}

module.exports = MercadoBitcoinApi