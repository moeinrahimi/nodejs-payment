import dotenv from 'dotenv';
import { Payment } from '../src/index';
let result = dotenv.config();

describe('payment verify', () => {
  test('verify transaction', async () => {
    if (!result.parsed) throw new Error('no .env found');
    let payment = new Payment('digipay', {
      username: result.parsed.USERNAME,
      password: result.parsed.PASSWORD_TEST,
      clientId: result.parsed.CLIENT_ID,
      clientSecret: result.parsed.CLIENT_SECRET_TEST,
    });
    let trackingCode = 2785759241632388583558;
    let res = await payment.verifyTransaction(trackingCode);
    expect(res).toHaveProperty('statusCode');
    expect(res).toHaveProperty('result');
    console.log('🚀 ~ file: blah.test.ts ~ line 11 ~ it ~ res', res);
  });
});
