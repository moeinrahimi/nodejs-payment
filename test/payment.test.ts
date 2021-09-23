import dotenv from 'dotenv';

import { Payment } from '../src/index';
let result = dotenv.config();

describe('payment', () => {
  test('sample purchase', async () => {
    if (!result.parsed) throw new Error('no .env found');
    let payment = new Payment('digipay', {
      username: result.parsed.USERNAME,
      password: result.parsed.PASSWORD_TEST,
      clientId: result.parsed.CLIENT_ID,
      clientSecret: result.parsed.CLIENT_SECRET_TEST,
    });
    let redirectUrl = 'http://localhost:8080';
    let phoneNumber = '09405478412';
    let invoiceNumber = Math.round(Math.random() * 1000).toString();
    let amount = 200000;
    let res = await payment.createTransaction(
      redirectUrl,
      phoneNumber,
      invoiceNumber,
      amount
    );
    expect(res).toHaveProperty('statusCode', 200);
    expect(res).toHaveProperty('ticket');
    console.log('🚀 ~ file: blah.test.ts ~ line 11 ~ it ~ res', res);
  });
});
