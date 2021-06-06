import { SECRET_KEY } from '../symbols';

export interface ClientKeysOptions {
  public: string;
  secret: string;
}

class ClientKeys {
  public: string;
  [SECRET_KEY]: string;

  constructor(options: ClientKeysOptions) {
    this.public = options.public;
    this[SECRET_KEY] = options.secret;
  }
}

export default ClientKeys;
