'use strict';
const url = require('url');
const querystring = require('querystring');
const Sender = require('./sender');
const crawlerSender = new Sender();
const cache = require('memory-cache');
const CACHE_TIMEOUT = 1000 * 60 * 5;
const config = require('../config/config.json');
const interestUrl = {
  getmasssendmsg: 'https://mp.weixin.qq.com/mp/getmasssendmsg?', // 文章列表
  getappmsgext: 'https://mp.weixin.qq.com/mp/getappmsgext?', // 阅读文章正文
};

/**
 * 爬虫server需要的参数解构
 */
// {
//   __biz: '',
//   key: '',
//   uin: '',
//   appmsg_token: '',
//   cookie: '',
// };

module.exports = {
  // 模块介绍
  summary: 'Wechat proxy rule',
  // 发送请求前拦截处理
  * beforeSendRequest(requestDetail) {
    // 打开文章列表，获取biz，key，uin
    if (requestDetail.url.includes(interestUrl.getmasssendmsg)) {
      const parsedUrl = url.parse(requestDetail.url);
      const query = querystring.parse(parsedUrl.query, null, null, { decodeURIComponent: str => { return str; } });
      const { __biz, uin, key } = query;
      if (__biz && uin && key) {
        const crawlerParams = {
          __biz,
          uin,
          key,
        };
        cache.put(`${__biz}@${uin}`, crawlerParams, CACHE_TIMEOUT);
      }
    } else if (requestDetail.url.includes(interestUrl.getappmsgext)) {
      const parsedUrl = url.parse(requestDetail.url);
      // 查看文章时微信传的__biz参数没有escape
      const query = querystring.parse(parsedUrl.query);
      let { appmsg_token, __biz, uin } = query;
      const cookie = requestDetail.requestOptions.headers.Cookie;
      if (appmsg_token && cookie && __biz && uin) {
        uin = querystring.escape(uin);
        const crawlerParams = cache.get(`${__biz}@${uin}`);
        if (crawlerParams) {
          crawlerParams.appmsg_token = appmsg_token;
          crawlerParams.cookie = cookie;
          cache.del(`${__biz}@${uin}`);
          console.log(JSON.stringify(crawlerParams, undefined, 4));
          // TODO 发送到爬虫server
          crawlerSender.client.post(`${config.crawler_server.path}`, crawlerParams);
        }
      }
    }
  },
  // 发送响应前处理
  * beforeSendResponse(requestDetail, responseDetail) {
    /* ... */
  },
  * onError(requestDetail, error) { /* ... */ },
  * onConnectError(requestDetail, error) { /* ... */ },
};
