// import undici from 'undici'
import soap from 'soap'
// import soap,{Client} from 'soap'
// import pino from 'pino'

export default class Saman {
  verifyURL: string = 'https://verify.sep.ir/Payments/ReferencePayment.asmx?WSDL';
  soapClient: any = null
  ready:Boolean=false
  constructor() {
    let _this = this
    this.soapClient = null
    this.initSoap()
      .then(client => {
        _this.soapClient = client
        _this.ready=true
        console.log('soap client ready')
      })
  }
  async initSoap() {
    return soap.createClientAsync(this.verifyURL)
  }


  // getToken  (redirectUrl:String, phoneNumber:String, gateway:String, invoice:String, sku:String,)  {
    // let { terminalId, getTokenUrl } = gateway.extra;
    // return new Promise((resolve, reject) => {
    //   let form = {
    //     Action: 'Token',
    //     Amount: invoice.amount, // RIAL
    //     TerminalId: terminalId,
    //     RedirectUrl: redirectUrl,
    //     ResNum: invoice._id,
    //     ResNum2: 26, // accounting use this to know transaction is for bento
    //     ResNum1: sku,
    //     ResNum3: phoneNumber,
    //     CellNumber: phoneNumber,
    //   };
    //   axios({
    //     url: getTokenUrl,
    //     method: 'POST',
    //     data: form,
    //   })
    //     .then((result) => {
    //       if (result.data.status === 1) {
    //         return resolve(result.data.token);
    //       }
    //       reject(result.data);
    //     })
    //     .catch((e) => {
    //       reject(e);
    //     });
    // });
  // };

  getWarningMessage(value: number): string  {

    let codes:WarningMessages = {
      '-1': 'خطای  در  پردازش  اطلاعات  ارسالی.(مشکل  در  یکی  از  ورودیها  و  ناموفق  بودن فراخوانی متد برگشت تراکنش',
      '-3': 'ورودیها حاوی کارکترهای غیرمجاز میباشند.',
      '-4': 'Failed Authentication Merchant (کلمه عبور یا کد فروشنده اشتباه است(',
      '-6': 'تراکنش قبال برگشت داده شده است.',
      '-7': 'رسید دیجیتالی تهی است.',
      '-8': 'طول ورودیها بیشتر از حد مجاز است.',
      '-9': 'وجود کارکترهای غیرمجاز در مبلغ برگشتی.',
      '-10': 'رسید دیجیتالی به صورت Base64 نیست )حاوی کارکترهای غیرمجاز است(.',
      '-11': 'طول ورودیها کمتر از حد مجاز است.',
      '-12': 'مبلغ برگشتی منفی است.',
      '-13':'مبلغ برگشتی برای برگشت جزئی بیش از مبلغ برگشت نخوردهی رسید دیجیتالی است',
      '-14': 'چنین تراکنشی تعریف نشده است.',
      '-15': 'مبلغ برگشتی به صورت اعشاری داده شده است.',
      '-16': 'خطای داخلی سیستم',
      '-17': 'برگشت زدن جزیی تراکنش مجاز نمی باشد.',
      '-18': 'Address IP فروشنده نا معتبر است'
    }
    return codes[value]
  }

  async verifyTransaction(refNum: number, terminalId: number): Promise<number | string> {
    let _this = this 
    if(!this.ready) this.soapClient  = await this.initSoap()
    return new Promise((resolve, reject) => {
      // if (this.ready) {
      this.soapClient.verifyTransaction(
        { String_1: refNum, String_2: terminalId },
        (err: null, result: verifyTransactionResult) => {
          if (err) {
            return reject(err);
          }
          let {
            result: { $value },
          } = result;
          if (Math.sign($value) === -1)
            return resolve (_this.getWarningMessage($value))
          return resolve($value);
        },
      );

    });
  }

}

let client = new Saman()
const run = async ()=>{
  console.log("🚀 ~ file: index.ts ~ line 72 ~ client", await client.verifyTransaction(1223,113688956))

}
  run()


interface verifyTransactionResult {
  result: {
    attributes: {},
    $value:number
  }
}

type WarningMessages = {
  [key: string]: string
}