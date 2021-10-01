type purchase = {
  status: boolean;
  statusCode: number;
  message: string;
  token?: string;
  raw: object; // original api payload
};

type verifyTransaction = {
  status: boolean;
  statusCode: number;
  message: string;
  amount?: number;
  raw: object;
};

export { purchase, verifyTransaction };
