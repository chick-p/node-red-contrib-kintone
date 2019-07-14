'use strict';
const request = require('request');

module.exports = function(RED) {
  function KintoneNode(n) {

    RED.nodes.createNode(this, n);
    const node = this;

    const reqTimeout = RED.settings.httpRequestTimeout? parseInt(RED.settings.httpRequestTimeout) : 120000;

    this.config = RED.nodes.getNode(n.config);

    node.on('input', (msg) => {
      const headers = createHeader(this.config);
      const body = createBody(n, msg);
      const opts = {
        method: n.method,
        url: `${this.config.url}/k/v1/records.json`,
        timeout: reqTimeout,
        headers: headers,
        body: JSON.stringify(body)
      };

      request(opts, (error, response, body) => {
        node.status({});
        try {
          if (error) {
            throw new Error(RED._('kintone.error.http-request-error'));
          }

          msg.payload = JSON.parse(body);
          msg.statusCode = response.statusCode;
          if (response.statusCode !== 200) {
            throw new Error(msg.payload.message);
          }
          node.send(msg);
        } catch (e) {
          node.error(e.message);
          node.status({
            fill: 'red',
            shape: 'ring',
            text: e.message
          });
        }
      });
    });
  }

  const createHeader = function(config) {
    const headers = {};
    headers['Content-Type'] = 'application/json';
    headers['X-Cybozu-Authorization'] = config.token;
    if (config.basicToken) {
      headers['Authorization'] = `Basic ${config.basicToken}`;
    }
    return headers;
  };

  const createBody = function(n, msg) {
    const body = {};
    body.app = n.appId;
    if (n.method === 'GET') {
      body.totalCount = true;
      body.query = n.query? n.query : msg.payload;
    }
    if (n.method === 'POST' || n.method === 'PUT') {
      body.records = n.records? JSON.parse(n.records) : msg.payload;
    }
    return body;
  };

  const KintoneConfig = function(n) {
    RED.nodes.createNode(this, n);
    if (this.credentials) {
      const buffer = new Buffer(
        `${this.credentials.username}:${this.credentials.password}`
      );
      this.token = buffer.toString('base64');
      this.url = `https://${this.credentials.domain}`;
      this.basicToken = this.credentials.basicToken;
    }
  };

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
      },
      basicToken: {
        type: 'password'
      }
    }
  });
};
