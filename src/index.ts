import { Saman } from './lib/gateways/saman';
import { DigiPay } from './lib/gateways/digipay';
type PaymentInput = {
  terminalId?: string;
  username: string;
  password: string;
  clientId: string;
  clientSecret: string;
  redisConnectionString: string;
};
class Payment {
  provider: string;
  client: Saman | DigiPay;
  constructor(provider: string, credentials: PaymentInput) {
    this.provider = provider;
    switch (provider) {
      case 'saman':
        this.client = new Saman(credentials.terminalId);
        break;
      case 'digipay':
        this.client = new DigiPay(
          credentials.username,
          credentials.password,
          credentials.clientId,
          credentials.clientSecret,
          credentials.redisConnectionString
        );
        break;
      default:
        throw new Error('no valid provider');
    }
  }

  async createTransaction(
    redirectUrl: string,
    phoneNumber: string,
    invoiceId: string,
    amount: number,
    extraData: object = {}
  ) {
    return this.client.purchase(
      redirectUrl,
      phoneNumber,
      invoiceId,
      amount,
      extraData
    );
  }

  verifyTransaction(refNum: number) {
    return this.client.verifyTransaction(refNum);
  }
}
export { Payment, DigiPay };
