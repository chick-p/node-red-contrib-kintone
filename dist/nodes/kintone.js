"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var js_base64_1 = require("js-base64");
var axios_1 = __importDefault(require("axios"));
var buildHeaders = function (config) {
    var headers = config.basicToken
        ? {
            Authorization: "Basic " + config.basicToken
        }
        : {};
    return __assign(__assign({}, headers), { 'Content-Type': 'application/json', 'X-Cybozu-Authorization': config.token });
};
module.exports = function (RED) {
    RED.nodes.registerType('kintone', function (props) {
        var _this = this;
        RED.nodes.createNode(this, props);
        var configNode = RED.nodes.getNode(props.config);
        var node = this;
        node.on('input', function (msg) { return __awaiter(_this, void 0, void 0, function () {
            var headers, body, resp, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers = buildHeaders(configNode);
                        body = props.method === 'GET' ?
                            {
                                app: props.appId,
                                totalCount: true,
                                query: props.query ? props.query : msg.payload,
                            } : {
                            app: props.appId,
                            records: props.records ? JSON.parse(props.records) : msg.payload
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default({
                                method: props.method,
                                url: configNode.url + "/k/v1/records.json",
                                timeout: RED.settings.httpRequestTimeout
                                    ? parseInt(RED.settings.httpRequestTimeout)
                                    : 120000,
                                headers: headers,
                                data: JSON.stringify(body)
                            })];
                    case 2:
                        resp = _a.sent();
                        node.status({});
                        msg.payload = resp.data;
                        node.send(msg);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        node.error(err_1);
                        console.log(err_1.data);
                        node.status({
                            fill: 'red',
                            shape: 'ring',
                            text: err_1.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    });
    RED.nodes.registerType('kintone-config', function (props) {
        RED.nodes.createNode(this, props);
        if (!this.credentials) {
            return;
        }
        this.token = js_base64_1.Base64.encode(this.credentials.username + ":" + this.credentials.password);
        this.url = "https://" + this.credentials.domain;
        if (this.credentials.basicToken) {
            this.basicToken = this.credentials.basicToken;
        }
    }, {
        credentials: {
            domain: { type: 'text' },
            username: { type: 'text' },
            password: { type: 'password' },
            basicToken: { type: 'password' },
        },
    });
};
