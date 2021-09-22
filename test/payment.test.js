const { Payment, DigiPay } = require('../dist');
const run = async () => {
  let payment = new Payment('saman', '123');
  let redirectUrl = 'http://localhost:8080';
  let phoneNumber = '09405478412';
  let invoiceNumber = '123';
  let amount = 100000;
  // let res = await payment.createTransaction(redirectUrl, phoneNumber, invoiceNumber, amount)
  // console.log("🚀 ~ file: index.ts ~ line 38 ~ res", res)

  let d = new DigiPay();
  const a = await d.getAccessToken();
  console.log('🚀 ~ file: payment.test.js ~ line 14 ~ run ~ a', a);
  // console.log("🚀 ~ file: payment.test.js ~ line 14 ~ run ~ a", await d.purchase(redirectUrl, phoneNumber, invoiceNumber, amount))
};

run();
