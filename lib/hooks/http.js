'use strict';
const url = require('url');
const { FORMAT_HTTP_HEADERS, Tags } = require('opentracing');

module.exports = app => {
  // 开始请求前
  app.httpclient.on('request', req => {
    const method = req.args.method || 'GET';
    req.args.headers = req.args.headers || {};
    const reqUrl = new url.URL(req.url);
    const path = `${reqUrl.pathname}${reqUrl.search}`;
    const spanOptions = {
      tags: {
        [Tags.HTTP_METHOD]: method,
        [Tags.HTTP_URL]: req.url,
        'http.req_body': req.args.data || {},
      },
      childOf: req.ctx && req.ctx.rootSpan,
    };
    const span = app.startSpan(`${path}`, spanOptions);
    req.span = span;
    app.tracer.inject(span, FORMAT_HTTP_HEADERS, req.args.headers);
  });
  // 请求结束后
  app.httpclient.on('response', result => {
    const span = result.req.span;
    if (!span) {
      return;
    }
    span.setTag(Tags.HTTP_STATUS_CODE, result.res.status);
    if (result.error) {
      span.setTag(Tags.ERROR, true);
      span.log({
        event: 'ERROR_HTTP_CURL',
        message: result.error.message,
        stack: result.error.stack,
      });
    }
    span.finish();
  });
};
