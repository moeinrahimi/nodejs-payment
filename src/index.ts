import { Saman } from './lib/gateways/saman';
import { DigiPay } from './lib/gateways/digipay';

class Payment {
  provider: string;
  client: Saman | DigiPay;
  constructor(provider: string, terminalId: string) {
    this.provider = provider;
    this.client = new Saman(terminalId);
  }

  async createTransaction(
    redirectUrl: string,
    phoneNumber: string,
    invoiceId: string,
    amount: number,
    extraData: object = {}
  ) {
    return this.client.getToken(
      redirectUrl,
      phoneNumber,
      invoiceId,
      amount,
      extraData
    );
  }

  verifyTransaction() {}
}
export { Payment, DigiPay };
