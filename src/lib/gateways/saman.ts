import undici from 'undici';
import soap, { Client } from 'soap';

class Saman {
  verifyURL: string =
    'https://verify.sep.ir/Payments/ReferencePayment.asmx?WSDL';
  getTokenUrl: string = 'https://sep.shaparak.ir/MobilePG/MobilePayment';
  soapClient: Client | undefined;
  ready: boolean = false;
  terminalId: string = '';
  constructor(terminalId: string | undefined) {
    if (!terminalId) throw new Error('no terminalId');
    this.terminalId = terminalId;
    let _this = this;
    this.initSoap().then(client => {
      _this.soapClient = client;
      _this.ready = true;
    });
  }
  async initSoap(): Promise<Client> {
    return soap.createClientAsync(this.verifyURL);
  }

  /**
   * @param  {string} redirectUrl
   * @param  {string} phoneNumber
   * @param  {string} resNum
   * @param  {number} amount
   * @param  {object={}} extraData
   * @returns Promise
   */
  async purchase(
    redirectUrl: string,
    phoneNumber: string,
    resNum: string,
    amount: number,
    extraData: object = {}
  ): Promise<getTokenResult> {
    let form = {
      Action: 'Token',
      Amount: amount, // RIAL
      TerminalId: this.terminalId,
      RedirectUrl: redirectUrl,
      ResNum: resNum,
      ...extraData,
      CellNumber: phoneNumber,
    };

    let { body } = await undici.request(this.getTokenUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(form),
    });
    let result = await body.json();
    return result;
  }
  /**
   * @param  {number} value
   * @returns string
   */
  getWarningMessage(value: number): string {
    let codes: WarningMessages = {
      '-1':
        'خطای  در  پردازش  اطلاعات  ارسالی.(مشکل  در  یکی  از  ورودیها  و  ناموفق  بودن فراخوانی متد برگشت تراکنش',
      '-3': 'ورودیها حاوی کارکترهای غیرمجاز میباشند.',
      '-4':
        'Failed Authentication Merchant (کلمه عبور یا کد فروشنده اشتباه است(',
      '-6': 'تراکنش قبال برگشت داده شده است.',
      '-7': 'رسید دیجیتالی تهی است.',
      '-8': 'طول ورودیها بیشتر از حد مجاز است.',
      '-9': 'وجود کارکترهای غیرمجاز در مبلغ برگشتی.',
      '-10': 'رسید دیجیتالی به صورت Base64 نیست )حاوی کارکترهای غیرمجاز است(.',
      '-11': 'طول ورودیها کمتر از حد مجاز است.',
      '-12': 'مبلغ برگشتی منفی است.',
      '-13':
        'مبلغ برگشتی برای برگشت جزئی بیش از مبلغ برگشت نخوردهی رسید دیجیتالی است',
      '-14': 'چنین تراکنشی تعریف نشده است.',
      '-15': 'مبلغ برگشتی به صورت اعشاری داده شده است.',
      '-16': 'خطای داخلی سیستم',
      '-17': 'برگشت زدن جزیی تراکنش مجاز نمی باشد.',
      '-18': 'Address IP فروشنده نا معتبر است',
    };
    return codes[value];
  }
  /**
   * @param  {number} refNum
   * @param  {number} terminalId
   * @returns Promise
   */
  async verifyTransaction(refNum: number): Promise<verifyTransactionResult> {
    let _this = this;
    if (!this.ready) this.soapClient = await this.initSoap();
    return new Promise((resolve, reject) => {
      this.soapClient?.verifyTransaction(
        { String_1: refNum, String_2: this.terminalId },
        (err: null, result: verifyTransactionCallback) => {
          if (err) {
            return reject(err);
          }
          let {
            result: { $value },
          } = result;
          let response: verifyTransactionResult = {
            status: true,
            message: 'عملیات با موفقیت انجام شد',
            amount: $value,
          };
          if (Math.sign($value) === -1) {
            response.message = _this.getWarningMessage($value);
            response.status = false;
            return resolve(response);
          }

          return resolve(response);
        }
      );
    });
  }
}

interface verifyTransactionCallback {
  result: {
    attributes: {};
    $value: number;
  };
}
type verifyTransactionResult = {
  status: boolean;
  message: string;
  amount?: number;
};
type WarningMessages = {
  [key: string]: string;
};

type getTokenResult = {
  status: number;
  errorCode: string;
  errorDesc: string;
  token?: string;
};
export { Saman };
