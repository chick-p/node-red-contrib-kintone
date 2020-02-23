import { Node, NodeProperties } from 'node-red';

export interface KintoneRequestProps extends NodeProperties {
  config: string;
  appId: string;
  method: 'GET' | 'POST' | 'PUT';
  query?: string;
  records?: string;
}

export interface ConnectConfig extends Node {
  credentials: {
    domain: string;
    username: string;
    password: string;
    basicToken: string | null;
  };
  url: string;
  token: string;
  basicToken?: string;
}

export interface NodeResponse {
  payload: string;
}
