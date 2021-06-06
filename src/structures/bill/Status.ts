import Bill from './Bill';

export type BillStatusValue = 'WAITING' | 'PAID' | 'REJECTED' | 'EXPIRED';

export interface IBillStatus {
  value: BillStatusValue;
  changedDateTime: string;
}

class BillStatus {
  private statusValue: BillStatusValue;
  public changedDate: Date;

  constructor(public bill: Bill, status: IBillStatus) {
    this.statusValue = status.value;
    this.changedDate = new Date(status.changedDateTime);
  }

  get waiting() {
    return this.statusValue === 'WAITING';
  }

  get finished() {
    return !this.waiting;
  }

  get expired() {
    return this.statusValue === 'EXPIRED';
  }

  get rejected() {
    return this.statusValue === 'REJECTED';
  }

  get value() {
    if (!this.finished && this.bill.expirationDate.getTime() < Date.now()) {
      this.statusValue = 'EXPIRED';
      this.changedDate = this.bill.expirationDate;
    }
    return this.statusValue;
  }

  patch(data: IBillStatus) {
    this.statusValue = data.value;
    if (data.changedDateTime != null) {
      const date = new Date(data.changedDateTime);
      this.changedDate.setTime(date.getTime());
    }
  }
}

export default BillStatus;
