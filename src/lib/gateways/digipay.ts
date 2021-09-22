import undici from 'undici';
import redis from 'ioredis';
import { Buffer } from 'buffer';
const FormData = require('form-data');
type accessTokenResponse = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  jti: string;
};
type purchaseResponse = {
  result: {
    status: number;
    message: string;
    level: string;
  };

  payUrl: string;
  ticket: string;
};

class DigiPay {
  baseURL: string = 'https://api.mydigipay.com';
  // baseURL: string = 'https://api.mydigipay.com';
  getTokenURL: string = `${this.baseURL}/digipay/api/oauth/token`;
  purchaseURL: string = `${this.baseURL}/digipay/api/businesses/ticket?type=0`;
  verifyURL: string = `${this.baseURL}/digipay/api/purchases/verify`;
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
    clientSecret: string
  ) {
    this.redis = new redis();
    this.username = username;
    this.password = password;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.getAccessToken(username, password, clientId, clientSecret).then(
      json => {
        this.accessToken = json.access_token;
        this.refreshToken = json.refresh_token;
      }
    );
  }
  async getAccessToken(
    username: string,
    password: string,
    clientId: string,
    clientSecret: string
  ): Promise<accessTokenResponse> {
    const buf = Buffer.from(`${clientId}:${clientSecret}`, 'utf8');
    const AUTH_HEADER = buf.toString('base64');
    this.AUTH_HEADER = AUTH_HEADER;
    let data = new FormData();
    data.append('username', username);
    data.append('password', password);
    data.append('grant_type', 'password');
    let { body } = await undici.request(this.getTokenURL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${AUTH_HEADER}`,
        ...data.getHeaders(),
      },
      body: data,
    });
    let json: accessTokenResponse = await body.json();
    return json;
  }

  async refreshTokenHandler() {
    let credentials = await this.redis.get('DIGIPAY_ACCESS_TOKEN');
    let data;
    if (credentials) {
      credentials = JSON.parse(credentials);
      let result = await this.refreshRequest();
      data = result;
    } else {
      let result = await this.getAccessToken(
        this.username,
        this.password,
        this.clientId,
        this.clientSecret
      );
      data = result;
    }
    this.redis.set('DIGIPAY_ACCESS_TOKEN', JSON.stringify(data));
    return data;
  }

  async getCredentials() {
    let data = JSON.parse(await this.redis.get('DIGIPAY_ACCESS_TOKEN'));
    if (!data) data = await this.refreshTokenHandler();
    return data;
  }

  async purchase(
    redirectUrl: string,
    phoneNumber: string,
    invoiceNumber: string,
    amount: number
  ): Promise<purchaseResponse> {
    let { body } = await undici.request(this.purchaseURL, {
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

    return body.json();
  }

  async verifyTransaction(trackingCode: string) {
    let { body } = await undici.request(`${this.verifyURL}/${trackingCode}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return body.json();
  }

  async refreshRequest() {
    let data = new FormData();
    data.append('refresh_token', this.refreshToken);
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
