import { Payment } from '../src/index';

describe('blah', () => {
  it('works', async () => {
    let payment = new Payment('saman', '123');
    let redirectUrl = 'http://localhost:8080';
    let phoneNumber = '09405478412';
    let invoiceNumber = '123';
    let amount = 100000;
    let res = await payment.createTransaction(
      redirectUrl,
      phoneNumber,
      invoiceNumber,
      amount
    );
    console.log('🚀 ~ file: blah.test.ts ~ line 11 ~ it ~ res', res);
  });
});
