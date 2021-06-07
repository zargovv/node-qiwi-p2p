export type AmountResolvable =
  | BillAmount
  | (Omit<IBillAmount, 'value'> & { value: string | number });

export interface IBillAmount {
  value: string;
  currency: 'USD' | 'EUR' | 'RUB';
}

class BillAmount {
  static from(amount: AmountResolvable) {
    if (amount instanceof BillAmount) return amount;
    return new BillAmount({
      currency: amount.currency,
      value: String(amount.value)
    });
  }

  static validate(amount: AmountResolvable) {
    const valueString = String(amount.value);
    const int = valueString.split('.')[0];
    const dec = valueString.split('.')[1] || '0';
    if (int.length > 6) throw new Error('INVALID_AMOUNT_VALUE');
    if (dec.length > 2) throw new Error('INVALID_AMOUNT_VALUE');
    return true;
  }

  value!: number;
  currency!: 'USD' | 'EUR' | 'RUB';

  constructor(amount: IBillAmount) {
    this.patch(amount);
  }

  patch(data: IBillAmount) {
    BillAmount.validate(data);
    this.value = Number(data.value);
    this.currency = data.currency;
  }
}

export default BillAmount;
