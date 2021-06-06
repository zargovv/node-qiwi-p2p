import Route, { FetchResponse } from '@/utils/Route';
import ClientKeys, { ClientKeysOptions } from './Keys';

import BillManager from '../bill/manager/Manager';
import { SECRET_KEY } from '../symbols';

interface ClientOptions {
  keys: ClientKeysOptions;
}

class Client {
  keys: ClientKeys;
  bills: BillManager;
  route: any;

  constructor(options: ClientOptions) {
    this.keys = new ClientKeys(options.keys);
    this.bills = new BillManager(this);
    this.route = Route('https://api.qiwi.com', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.keys[SECRET_KEY]}`,
        'content-type': 'application/json'
      }
    });
  }

  handleRequest<T>(req: Promise<FetchResponse>): Promise<T> {
    return req
      .then(res => {
        if (res.statusCode && Math.floor(res.statusCode / 100) !== 2) {
          return Promise.reject(res.body);
        }
        return res.body;
      })
      .then(res => JSON.parse(res));
  }
}

export default Client;
