'use strict';

const axios = require('axios');
const config = require('../config/config.json');

class Sender {

  constructor() {
    let baseURL = `${config.crawler_server.host}` +
    (config.crawler_server.port ? `:${config.crawler_server.port}` : '');
    const senderConfig = {
      baseURL,
      timeout: 30000,
    };
    this.client = axios.create(senderConfig);
  }
}

module.exports = Sender;
