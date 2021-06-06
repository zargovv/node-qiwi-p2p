import BillManager from './manager/Manager';
import BillStatus, { IBillStatus } from './Status';
import BillCustomFields, { IBillCustomFields } from './CustomFields';
import BillAmount, { IBillAmount } from './Amount';

export interface BillCustomer {
  phone?: string;
  email?: string;
  account?: string;
}

export interface IBill {
  siteId: string;
  billId: string;
  amount: IBillAmount;
  status: IBillStatus;
  customer: BillCustomer;
  customFields: IBillCustomFields;
  comment: string;
  creationDateTime: string;
  expirationDateTime: string;
  payUrl: string;
}

class Bill {
  public id: string;
  public amount: BillAmount;
  public comment: string;
  public creationDate: Date;
  public customFields: BillCustomFields | null;
  public customer: BillCustomer;
  public expirationDate: Date;
  public payUrl: string;
  public siteId: string;
  public status: BillStatus;

  constructor(public manager: BillManager, bill: IBill) {
    this.id = bill.billId;
    this.amount = new BillAmount(bill.amount);
    this.comment = bill.comment;
    this.creationDate = new Date(bill.creationDateTime);
    this.customFields = bill.customFields
      ? new BillCustomFields(bill.customFields)
      : null;
    this.customer = bill.customer;
    this.expirationDate = new Date(bill.expirationDateTime);
    this.payUrl = bill.payUrl;
    this.siteId = bill.siteId;
    this.status = new BillStatus(this, bill.status);
  }

  get estimated() {
    return Date.now() - this.creationDate.getTime();
  }

  get remaining() {
    return Math.max(0, this.expirationDate.getTime() - Date.now());
  }

  get waiting() {
    return this.status.waiting;
  }

  get finished() {
    return this.status.finished;
  }

  get expired() {
    return this.status.expired;
  }

  get rejected() {
    return this.status.rejected;
  }

  check() {
    return this.manager.check(this.id);
  }

  reject() {
    if (this.finished) throw new Error('BILL_FINISHED');
    return this.manager.reject(this.id);
  }

  poll(interval = 1e4) {
    return new Promise<Bill>((resolve, reject) => {
      const handler = () => {
        this.check()
          .then(bill => {
            if (bill.finished) return resolve(bill);
            setTimeout(handler, interval);
          })
          .catch(reject);
      };
      handler();
    });
  }

  patch(data: Partial<IBill>) {
    if (data.amount != null) this.amount.patch(data.amount);
    if (data.comment != null) this.comment = data.comment;
    if (data.creationDateTime != null) {
      const date = new Date(data.creationDateTime);
      this.creationDate.setTime(date.getTime());
    }
    // if (data.customFields != null) {
    //   this.customFields = new BillCustomFields(data.customFields);
    // }
    if (data.customer != null) this.customer = data.customer;
    if (data.expirationDateTime != null) {
      const date = new Date(data.expirationDateTime);
      this.expirationDate.setTime(date.getTime());
    }
    if (data.payUrl != null) this.payUrl = data.payUrl;
    if (data.siteId != null) this.siteId = data.siteId;
    if (data.status != null) this.status.patch(data.status);
  }

  toString() {
    return `${this.amount.currency}|${this.amount.value}|${this.id}|${this.siteId}|${this.status.value}`;
  }
}

export default Bill;
