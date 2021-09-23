import undici from 'undici';
import redis from 'ioredis';
// import pino from 'pino'
import { Buffer } from 'buffer';
const FormData = require('form-data');

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
  baseURL: string = 'https://api.mydigipay.com/digipay/api';
  // baseURL_TEST: string = 'https://uat.mydigipay.info';
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
    redisConnectionString: string = '127.0.0.1:6379'
  ) {
    this.redis = new redis(redisConnectionString);
    this.username = username;
    this.password = password;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.setAuthHeader();
    this.refreshTokenHandler();
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
  ): Promise<purchaseResponse> {
    if (!this.accessToken) await await this.refreshTokenHandler();
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
    let res = undefined;
    if (statusCode === 200) res = await body.json();
    return {
      statusCode: statusCode,
      ...res,
    };
  }

  async verifyTransaction(trackingCode: number) {
    if (!this.accessToken) await this.refreshTokenHandler();
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
    return {
      statusCode,
      ...res,
    };
  }

  async refreshTokenHandler() {
    let credentials = await this.redis.get('DIGIPAY_ACCESS_TOKEN');
    let data;
    if (credentials) {
      credentials = JSON.parse(credentials);
      let result = await this.refreshRequest(credentials.refresh_token);
      data = result;
    } else {
      let result = await this.getAccessToken(this.username, this.password);
      data = result;
    }
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.redis.set('DIGIPAY_ACCESS_TOKEN', JSON.stringify(data));
    return data;
  }

  async getAccessToken(
    username: string,
    password: string
  ): Promise<accessTokenResponse> {
    let data = new FormData();
    data.append('username', username);
    data.append('password', password);
    data.append('grant_type', 'password');
    let { body, statusCode } = await undici.request(this.getTokenURL, {
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
    if (statusCode !== 200) throw new Error(json.error);
    // pino().info('ready for new transaction',json,statusCode)
    return json;
  }

  async getCredentials() {
    let data = JSON.parse(await this.redis.get('DIGIPAY_ACCESS_TOKEN'));
    if (!data) data = await this.refreshTokenHandler();
    return data;
  }

  async refreshRequest(refresh_token: string) {
    let data = new FormData();
    data.append('refresh_token', refresh_token);
    data.append('grant_type', 'refresh_token');
    let url = `${this.baseURL}/digipay/api/oauth/token`;
    let { body } = await undici.request(url, {
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
