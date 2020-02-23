import { Red, Node, NodeProperties } from 'node-red';
import { Base64 } from 'js-base64';
import Axios from 'axios';

import { KintoneRequestProps, NodeResponse, ConnectConfig } from './lib/interfaces';

type KintoneAuthHeader = {
  'Content-Type': string;
  'X-Cybozu-Authorization': string;
  Authorization?: string;
};

const buildHeaders = (config: ConnectConfig): KintoneAuthHeader => {
  const headers = config.basicToken
    ? {
      Authorization: `Basic ${config.basicToken}`
    }
    : {};
  return {
    ...headers,
    'Content-Type': 'application/json',
    'X-Cybozu-Authorization': config.token
  };
};

export const kintoneNode = (RED: Red) => {
  RED.nodes.registerType('kintone', function (
    this: Node,
    props: KintoneRequestProps,
  ) {
    RED.nodes.createNode(this, props);
    const configNode = RED.nodes.getNode(props.config) as ConnectConfig;
    const node = this;

    node.on('input', async (msg: NodeResponse) => {
      const headers = buildHeaders(configNode);
      const body = props.method === 'GET' ?
        {
          app: props.appId,
          totalCount: true,
          query: props.query ? props.query : msg.payload,
        } : {
          app: props.appId,
          records: props.records ? JSON.parse(props.records) : msg.payload
        };
      try {
        const resp = await Axios({
          method: props.method,
          url: `${configNode.url}/k/v1/records.json`,
          timeout: RED.settings.httpRequestTimeout
            ? parseInt(RED.settings.httpRequestTimeout)
            : 120000,
          headers: headers,
          data: JSON.stringify(body)
        });
        node.status({});
        msg.payload = resp.data;
        node.send(msg);
      } catch (err) {
        node.error(err);
        console.log(err.data);
        node.status({
          fill: 'red',
          shape: 'ring',
          text: err.message
        });
      }
    });
  });

  RED.nodes.registerType(
    'kintone-config',
    function (this: ConnectConfig, props: NodeProperties): void {
      RED.nodes.createNode(this, props);
      if (!this.credentials) {
        return;
      }
      this.token = Base64.encode(`${this.credentials.username}:${this.credentials.password}`);
      this.url = `https://${this.credentials.domain}`;
      if (this.credentials.basicToken) {
        this.basicToken = this.credentials.basicToken;
      }
    },
    {
      credentials: {
        domain: { type: 'text' },
        username: { type: 'text' },
        password: { type: 'password' },
        basicToken: { type: 'password' },
      },
    },
  );
};

