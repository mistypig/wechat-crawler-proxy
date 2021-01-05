'use strict';
const AnyProxy = require('anyproxy');
const options = {
  port: process.env.ANY_PROXY_PORT || 8888,
  rule: require('./lib/rule'),
  webInterface: {
    enable: true,
    webPort: process.env.ANY_PROXY_WEB_PORT || 8889,
  },
  throttle: 10000,
  forceProxyHttps: true,
  wsIntercept: false, // 不开启websocket代理
  silent: true,
  dangerouslyIgnoreUnauthorized: true,
};

const proxyServer = new AnyProxy.ProxyServer(options);

proxyServer.on('ready', () => { /* */ });
proxyServer.on('error', e => { /* */ });
proxyServer.start();
