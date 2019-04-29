'use strict';
const request = require('request');

module.exports = function(RED) {
  function KintoneNode(n) {

    RED.nodes.createNode(this, n);
    const node = this;

    let reqTimeout = 120000;
    if (RED.settings.httpRequestTimeout) {
      reqTimeout = parseInt(RED.settings.httpRequestTimeout) || 120000;
    }

    this.config = RED.nodes.getNode(n.config);

    let headers = createHeader(this.config);
    let body = createBody(n);
    let opts = {
      method: n.method,
      url: `${this.config.url}/k/v1/records.json`,
      timeout: reqTimeout,
      headers: headers,
      body: JSON.stringify(body)
    };

    node.on('input', (msg) => {
      request(opts, (error, response, body) => {
        node.status({});
        if (error) {
          node.error(error, msg);
          msg.payload = `${error.toString()}:${opts.url}`;
          msg.statusCode = error.code;
          node.send(msg);
          node.status({
            fill: 'red',
            shape: 'ring',
            text: error.code
          });
        } else {
          msg.payload = body;
          try {
            msg.payload = JSON.parse(msg.payload);
          } catch (e) {
            node.warn(RED._('kintone.errors.json-error'));
          }
          msg.statusCode = response.statusCode;
          node.send(msg);
        }
      });
    });
  }

  let createHeader = function(config) {
    let headers = {};
    headers['Content-Type'] = 'application/json';
    headers['X-Cybozu-Authorization'] = config.token;
    return headers;
  };

  let createBody = function(n) {
    let body = {};
    body.app = n.appId;
    if (n.method === 'GET') {
      body.totalCount = true;
      if (n.query) {
        body.query = n.query;
      }
    }
    if (n.method === 'POST' || n.method === 'PUT') {
      body.records = JSON.parse(n.records);
    }
    return body;
  };

  function KintoneConfig(n) {
    RED.nodes.createNode(this, n);
    if (this.credentials) {
      const buffer = new Buffer(
        `${this.credentials.username}:${this.credentials.password}`
      );
      this.token = buffer.toString('base64');
      this.url = `https://${this.credentials.domain}`;
    }
  }

  RED.nodes.registerType('kintone', KintoneNode, {});
  RED.nodes.registerType('kintone-config', KintoneConfig, {
    credentials: {
      domain: {
        type: 'text'
      },
      username: {
        type: 'text'
      },
      password: {
        type: 'password'
      }
    }
  });
};
