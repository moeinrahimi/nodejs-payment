import dotenv from 'dotenv'
let result = dotenv.config()

import { Payment } from '../src/index';

describe('blah', () => {
  test('sample purchase', async () => {
    if (!result.parsed) throw new Error('err')
    let payment = new Payment('digipay', {
      username: result.parsed.USERNAME,
      password: result.parsed.PASSWORD,
      clientId: result.parsed.CLIENT_ID,
      clientSecret:result.parsed.CLIENT_SECRET
    });
    // let redirectUrl = 'http://localhost:8080';
    // let phoneNumber = '09405478412';
    // let invoiceNumber = '12345671';
    // let amount = 100000;
    // let res = await payment.createTransaction(
    //   redirectUrl,
    //   phoneNumber,
    //   invoiceNumber,
    //   amount
    // );
    // expect(res).toHaveProperty('ticket')

    let res = await payment.verifyTransaction(181397078054)
    expect(res).toHaveProperty('status')
    console.log('🚀 ~ file: blah.test.ts ~ line 11 ~ it ~ res', res);
  });
});
