import dotenv from 'dotenv';

import { Payment } from '../src/index';
let result = dotenv.config();

describe('payment', () => {
  test('saman purchase', () => {
    if (!result.parsed) throw new Error('no .env found');
    let payment = new Payment('saman', {
      terminalId: result.parsed.TERMINAL_ID,
    });
    let redirectUrl = 'http://localhost';
    let phoneNumber = '09405478411';
    let invoiceNumber = Math.round(Math.random() * 1000).toString();
    let amount = 200000;
    payment
      .createTransaction(redirectUrl, phoneNumber, invoiceNumber, amount)
      .then(res => {
        expect(res).toHaveProperty('status');
      });
  });
});
