import Client from '../../client/Client';
import BillManagerCache from './Cache';

import BillCustomFields, { CustomFieldsResolvable } from '../CustomFields';
import BillAmount, { AmountResolvable } from '../Amount';
import Bill, { BillCustomer, IBill } from '../Bill';
import { FetchResponse } from '@/utils/Route';

interface CreateBillOptions {
  amount: AmountResolvable;
  remaining?: number;
  expiration?: Date | string | number;
  customer?: BillCustomer;
  comment?: string;
  customFields?: CustomFieldsResolvable;
}

class BillManager {
  static toISOString(date: Date) {
    if (Number.isNaN(date.getTime())) {
      throw new Error('INVALID_EXPIRATION_DATE_TIME');
    }

    const format = (arg: string | number) => `0${arg}`.slice(-2);

    const year = date.getFullYear();
    const month = format(date.getMonth() + 1);
    const day = format(date.getDate());

    const hours = format(date.getHours());
    const mins = format(date.getMinutes());
    const seconds = format(date.getSeconds());

    const tzOffset = date.getTimezoneOffset();
    const offset = {
      negative: tzOffset < 0,
      hours: Math.abs(Number(Math.floor(tzOffset / 60))),
      mins: Math.abs(tzOffset % 60)
    };

    const offsetHours = `0${offset.hours}`.slice(-2);
    const offsetMins = `0${offset.mins}`.slice(-2);

    return `${year}-${month}-${day}T${hours}:${mins}:${seconds}${
      offset.negative ? '-' : '+'
    }${offsetHours}:${offsetMins}`;

    // const regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-])(\d{2}):(\d{2})$/
    // if (!regex.test(dateTime))

    // const date = new Date(dateTime)
    // if (Date.now() >= date.getTime()) {
    //   throw new Error('INVALID_EXPIRATION_DATE_TIME')
    // }

    // return true
  }

  static validateComment(comment: string) {
    if (comment.length > 255) throw new Error('INVALID_COMMENT');
    return true;
  }

  public cache = new BillManagerCache(this);

  constructor(public client: Client) {}

  get route() {
    return this.client.route.partner.bill('v1');
  }

  create(billId: string, options: CreateBillOptions): Promise<Bill> {
    if (!options.remaining && !options.expiration) {
      throw new Error('INVALID_EXPIRATION_DATE');
    }

    if (options.remaining && options.expiration) {
      throw new Error('INVALID_EXPIRATION_DATE');
    }

    if (options.remaining) {
      options.expiration = Date.now() + options.remaining;
    }

    if (!(options.expiration instanceof Date)) {
      options.expiration = new Date(options.expiration as number | string);
    }

    BillAmount.validate(options.amount);
    if (options.comment) BillManager.validateComment(options.comment);

    const expiration = BillManager.toISOString(options.expiration);
    const customFields =
      options.customFields && BillCustomFields.from(options.customFields);

    const requestBody = {
      amount: options.amount,
      expirationDateTime: expiration
    };

    if (options.customer != null) {
      Object.assign(requestBody, { customer: options.customer });
    }
    if (options.comment != null) {
      Object.assign(requestBody, { comment: options.comment });
    }
    if (customFields) Object.assign(requestBody, customFields.raw());

    const req: Promise<FetchResponse> = this.route
      .bills(billId)
      .put({ body: JSON.stringify(requestBody) });
    return this.client
      .handleRequest<IBill>(req)
      .then(bill => this.cache.add(bill));
  }

  check(billId: string): Promise<Bill> {
    return this.client
      .handleRequest<IBill>(this.route.bills(billId).get())
      .then(bill => this.cache.add(bill));
  }

  reject(billId: string): Promise<Bill> {
    const existing = this.cache.get(billId);
    if (existing && existing.finished) throw new Error('BILL_FINISHED');

    return this.client
      .handleRequest<IBill>(this.route.bills(billId).reject.post())
      .then(bill => this.cache.add(bill));
  }
}

export default BillManager;
