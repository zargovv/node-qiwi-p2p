import BillManager from './Manager';
import Bill, { IBill } from '../Bill';

class BillManagerCache extends Map<string, Bill> {
  constructor(public manager: BillManager) {
    super();
  }

  add(data: IBill) {
    const existing = this.get(data.billId);
    if (existing) {
      existing.patch(data);
      return existing;
    }

    const bill = new Bill(this.manager, data);
    this.set(bill.id, bill);
    return bill;
  }
}

export default BillManagerCache;
