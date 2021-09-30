import undici from 'undici';
import redis from 'ioredis';
import { Buffer } from 'buffer';
const FormData = require('form-data');
import { purchase, verifyTransaction } from './types'

type accessTokenResponse = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  jti: string;
  error?: string;
};
type purchaseResponse = {
  statusCode: number;
  result: {
    status: number;
    message: string;
    level: string;
  };
  payUrl: string;
  ticket: string;
};

class DigiPay {
  baseURL: string = 'https://uat.mydigipay.info/digipay/api';
  // baseURL: string = 'https://api.mydigipay.com/digipay/api';
  getTokenURL: string = `${this.baseURL}/oauth/token`;
  purchaseURL: string = `${this.baseURL}/businesses/ticket?type=0`;
  verifyURL: string = `${this.baseURL}/purchases/verify`;
  accessToken: string | undefined;
  refreshToken: string | undefined;
  AUTH_HEADER: string | undefined;
  username: string;
  password: string;
  clientId: string;
  clientSecret: string;
  redis: any;
  constructor(
    username: string,
    password: string,
    clientId: string,
    clientSecret: string,
    redisConnectionString: string = '127.0.0.1:6379'//TODO:redis h
  ) {
    this.redis = new redis(redisConnectionString);
    this.username = username;
    this.password = password;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.setAuthHeader();
    let ms = 3000000; // 50 minutes
    setInterval(this.refreshTokenHandler, ms);
  }

  setAuthHeader() {
    const buf = Buffer.from(`${this.clientId}:${this.clientSecret}`, 'utf8');
    const AUTH_HEADER = buf.toString('base64');
    this.AUTH_HEADER = AUTH_HEADER;
  }

  async purchase(
    redirectUrl: string,
    phoneNumber: string,
    invoiceNumber: string,
    amount: number
  ): Promise<purchase> {
    return new Promise(async (resolve, reject) => {
      if (!this.accessToken)
        await this.refreshTokenHandler().catch(e => reject(e));
      let { statusCode, body } = await undici.request(this.purchaseURL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount, // Rial
          cellNumber: phoneNumber,
          providerId: invoiceNumber,
          redirectUrl: redirectUrl,
          userType: 0,
        }),
      });
      let res:purchaseResponse = await body.json();
      let purchaseObject: purchase = {
        status: res.payUrl ? true : false,
        statusCode:statusCode,
        message: res.payUrl ? 'توکن با موفقیت دریافت شد' : 'مشکلی پیش آمده است',
        token:res.payUrl?res.payUrl: '',
        raw:res
      }
      return resolve(purchaseObject);
    });
  }

  async verifyTransaction(trackingCode: number):Promise<verifyTransaction> {
    return new Promise(async (resolve, reject) => {
      if (!this.accessToken)
        await this.refreshTokenHandler().catch(e => reject(e));
      let { statusCode, body } = await undici.request(
        `${this.verifyURL}/${trackingCode}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      let res = await body.json();
      return resolve({
        status: res.status === 0 ? true : false,
        message:res.result.message,
        statusCode:statusCode,
        raw:res
      });
    });
  }

  async refreshTokenHandler() {
    return new Promise(async (resolve, reject) => {
      let credentials = await this.redis.get('DIGIPAY_ACCESS_TOKEN');
      let data;
      if (credentials) {
        credentials = JSON.parse(credentials);
        data = await this.refreshRequest(credentials.refresh_token);
        if (!data) reject({ ...credentials, head: this.AUTH_HEADER });
      } else {
        data = await this.getAccessToken(this.username, this.password);
        if (!data.access_token)
          return reject({
            ...data,
            username: this.username,
            password: this.password,
            header: this.AUTH_HEADER,
          });
      }
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.redis.set('DIGIPAY_ACCESS_TOKEN', JSON.stringify(data));
      return resolve(data);
    });
  }

  async getAccessToken(
    username: string,
    password: string
  ): Promise<accessTokenResponse> {
    let data = new FormData();
    data.append('username', username);
    data.append('password', password);
    data.append('grant_type', 'password');
    let { body } = await undici.request(this.getTokenURL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.AUTH_HEADER}`,
        ...data.getHeaders(),
      },
      body: data,
    });
    let json: accessTokenResponse = await body.json();
    this.accessToken = json.access_token;
    this.refreshToken = json.refresh_token;
    return json;
  }

  async refreshRequest(refresh_token: string) {
    let data = new FormData();
    data.append('refresh_token', refresh_token);
    data.append('grant_type', 'refresh_token');
    let { body } = await undici.request(this.getTokenURL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.AUTH_HEADER}`,
        ...data.getHeaders(),
      },
      body: data,
    });
    return body.json();
  }
  getToken() {}
}
export { DigiPay };
