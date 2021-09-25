# still under development

# installation
```

npm i persianPayment
```
there are two main method named createTransaction and verifyTransaction.
# Example Usage of Saman

```js
import { Payment } from '../src/index';
let payment = new Payment('saman', { terminalId: terminalId });
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

// callback api
let refNum = 2785759241632388583558;
let res = await payment.verifyTransaction(refNum);
```

# Example Usage of Digipay

```js
import { Payment } from '../src/index';
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

// callback api
let trackingCode = 2785759241632388583558;
let res = await payment.verifyTransaction(trackingCode);
```
