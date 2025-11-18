// Polyfills that must be loaded before Next.js modules
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Web API polyfills
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = typeof input === 'string' ? input : input.url;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body;
  }
};

global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.ok = this.status >= 200 && this.status < 300;
  }
  
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
};

global.Headers = class Headers {
  constructor(init = {}) {
    this.map = new Map(Object.entries(init));
  }
  get(name) { return this.map.get(name); }
  set(name, value) { this.map.set(name, value); }
  has(name) { return this.map.has(name); }
  delete(name) { this.map.delete(name); }
  append(name, value) { this.map.set(name, value); }
  entries() { return this.map.entries(); }
  keys() { return this.map.keys(); }
  values() { return this.map.values(); }
};

