import * as http from 'http';
import * as https from 'https';

class Url {
  href: string | null;
  origin: string | null;
  protocol: string | null;
  host: string | null;
  path: string | null;
  search: string | null;
  hash: string | null;

  constructor(url: string) {
    const regex = /^((https?:)\/\/([^\/?#]+))([^?#]*)(\?[^#]+)?(#.*)?$/i;
    const match = regex.exec(url);
    if (!match) throw new Error('Invalid url provided');

    this.href = url || null;
    this.origin = match[1] || null;
    this.protocol = match[2] || null;
    this.host = match[3] || null;
    this.path = match[4] || null;
    this.search = match[5] || null;
    this.hash = match[6] || null;
  }
}

type Method = 'GET' | 'POST' | 'PATCH';
type ContentType = 'application/json';

interface Headers {
  Authorization: `${`${'Bearer' | 'Bot'} ` | ''}${string}`;
  'Content-Type': ContentType;
  Accept: ContentType;
}

type FetchOptions = Partial<{
  method: Method;
  body: string;
  headers: { [H in keyof Headers]?: Headers[H] } & {
    [H: string]: string;
  };
}>;

export type FetchResponse = http.IncomingMessage & { body: string };

function fetch(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResponse> {
  return new Promise((resolve, reject) => {
    const uri = new Url(url);
    const protocol = uri.protocol === 'https:' ? https : http;

    const headers = Object.assign({}, options.headers);
    const reqOptions = {
      headers,
      method: (options.method || 'GET').toUpperCase()
    };
    const req = protocol.request(Object.assign(reqOptions, uri));
    req.on('response', response => {
      const chunks: Buffer[] = [];
      const res = response as FetchResponse;
      res.on('data', chunk => chunks.push(chunk));
      res.on('error', reject);
      res.on('end', () => {
        res.body = Buffer.concat(chunks).toString('utf8');
        resolve(res);
      });
    });
    if (options.body != null) req.write(options.body);
    req.end();
  });
}

function retryFetch(url: string, options: FetchOptions = {}) {
  return fetch(url, options).then(res => {
    if (res.statusCode === 429) {
      const retryAfter = Number(res.headers['retry-after']);
      if (!Number.isFinite(retryAfter)) return res;
      return new Promise(resolve => {
        setTimeout(() => resolve(fetch(url, options)), retryAfter * 1e3);
      });
    }

    return res;
  });
}

function Route(baseRoute = '', baseOptions: FetchOptions = {}) {
  if (baseRoute.endsWith('/')) baseRoute = baseRoute.slice(0, -1);

  const Target = (res: any) => {
    return function Route() {
      return res;
    };
  };
  const handler: ProxyHandler<any> = {
    get(target, name, _receiver) {
      const data = target();
      const route = data.route.concat([]);
      const query = data.query.concat([]);
      const hash = data.hash.concat([]);

      route.push(name);

      return new Proxy(Target({ route, query, hash }), handler);
    },

    apply(target, _thisValue, args = []) {
      const data = target();
      const route = data.route.concat([]);
      const query = data.query.concat([]);
      const hash = data.hash.concat([]);

      const lastRoute = route[route.length - 1];

      if (query.length > 0 && query[query.length - 1] !== '--end') {
        const name = route.pop();

        if (name === 'end' && args.length < 1) {
          query.push('--end');
          return new Proxy(Target({ route, query, hash }), handler);
        }

        query.push({ name, value: '0' in args ? args[0] : true });
        return new Proxy(Target({ route, query, hash }), handler);
      }

      if (http.METHODS.includes(lastRoute.toUpperCase())) {
        const method = route.pop().toUpperCase();
        const options = Object.assign({ method }, baseOptions, args[0]);
        const headers = Object.assign({}, options.headers, baseOptions.headers);
        Object.assign(options, { headers });

        const queryParams = [];
        for (const q of query) {
          if (typeof q !== 'string') {
            const name = encodeURIComponent(q.name);
            const value = encodeURIComponent(q.value);
            queryParams.push(`${name}=${value}`);
          }
        }

        const urlParts = [`${baseRoute}/${route.join('/')}`];
        if (queryParams.length > 0) urlParts.push(`?${queryParams.join('&')}`);
        if (hash.length > 0) urlParts.push(`#${hash[0]}`);

        return retryFetch(urlParts.join(''), options);
      }

      if (lastRoute === 'query') {
        route.pop();
        query.push('--start');
        return new Proxy(Target({ route, query, hash }), handler);
      }

      if (lastRoute === 'hash') {
        route.pop();
        hash.splice(0, hash.length, args[0]);
        return new Proxy(Target({ route, query, hash }), handler);
      }

      route.push(...args);

      return new Proxy(Target({ route, query, hash }), handler);
    }
  };

  return new Proxy(Target({ route: [], query: [], hash: [] }), handler);
}

export default Route;
