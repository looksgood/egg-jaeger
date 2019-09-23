# egg-jaeger

`Jaeger` 链路追踪插件。支持功能：

1. `Http` 调用链路。
2. `Sequelize` 的 `SQL`语句跟踪。
3. `Redis` 的 `Command`命令跟踪。

### 效果图

![](https://raw.githubusercontent.com/zijin-m/egg-jaeger/master/assets/demo.png)

### 重要说明

对于 `Sequelize` 和 `Redis` 的跟踪依赖了 `Async Hooks` 特性，该特性在目前版本(`12.10.0`)的 Node 中依然是实验性的，请慎重在生产环境中使用。

### 统一 `TraceId` 返回

默认会在 `ctx.body` 中返回 `traceId` 字段。

```js
{
  ok: true,
  traceId: "a3c92d1c813533d5"
}
```

## 安装

```bash
$ npm i @zijin-m/egg-jaeger --save
```

## 使用

```js
// {app_root}/config/plugin.js
exports.jaeger = {
  enable: true,
  package: 'egg-jaeger'
};
```

## 配置

```js
// {app_root}/config/config.default.js
exports.jaeger = {
  serviceName: 'your-awesome-service',
  sampler: {
    type: 'const',
    param: 1
  },
  reporter: {
    // Provide the traces endpoint; this forces the client to connect directly to the Collector and send
    // spans over HTTP
    collectorEndpoint: 'http://jaeger-collector:14268/api/traces'
    // Provide username and password if authentication is enabled in the Collector
    // username: '',
    // password: '',
  },
  sequelize: false, // 默认不开启sequelize记录
  redis: false //默认不开启redis记录
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## 示例

### HTTP 链路

1. 通过 `egg` 自带的 `HttpClient` 进行 `http` 调用，注意要使用 `ctx.curl` 而不要用 `app.curl` ，因为 `ctx.curl` 才能正确的传递 `ctx上下文信息` 用来链路追踪。

```js
ctx.curl('http://www.google.com');
```

2. 通过 npm 包 [request-promise-jaeger](https://www.npmjs.com/package/request-promise-jaeger) 进行 `http` 调用，这种方式需要手动传入 `ctx.tracer` 和 `ctx.rootSpan` 作为请求参数。

```js
const rp = require('request-promise-jaeger');

rp('http://www.google.com', {
  tracer: ctx.tracer,
  rootSpan: ctx.rootSpan
  // ... other options
});
```

### Sequelize 跟踪

通过配置 `sequelize: true` 开启，开启后会为每个 `SQL` 操作创建 `Span`

### Redis 跟踪

通过配置 `redis: true` 开启，开启后会为每个 `Command` 操作创建 `Span`

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
