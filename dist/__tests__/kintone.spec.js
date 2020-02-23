"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_red_node_test_helper_1 = __importDefault(require("node-red-node-test-helper"));
var nock_1 = __importDefault(require("nock"));
var kintone_1 = __importDefault(require("nodes/kintone"));
node_red_node_test_helper_1.default.init(require.resolve('node-red'));
describe('kintone Node', function () {
    beforeEach(function (done) {
        node_red_node_test_helper_1.default.startServer(done);
    });
    afterEach(function (done) {
        nock_1.default.cleanAll();
        node_red_node_test_helper_1.default.unload();
        node_red_node_test_helper_1.default.stopServer(done);
    });
    it('should be loaded', function (done) {
        var flow = [{ id: 'n1', type: 'kintone', name: 'kintone' }];
        node_red_node_test_helper_1.default.load(kintone_1.default, flow, function () {
            var n1 = node_red_node_test_helper_1.default.getNode('n1');
            expect(n1.name).toBe('kintone');
            done();
        });
    });
    it('should request to kintone', function (done) {
        nock_1.default('https://example.cybozu.com')
            .get('/k/v1/records.json')
            .reply(200, { totalCount: '20' });
        var flow = [
            {
                id: 'n1',
                type: 'kintone',
                name: 'kintone',
                wires: [['n2']],
                config: 'n3',
                appId: 168,
                method: 'GET'
            },
            { id: 'n2', type: 'helper' },
            { id: 'n3', type: 'kintone-config' }
        ];
        var credentials = {
            n3: {
                domain: 'example.cybozu.com',
                username: 'foo',
                password: 'bar'
            }
        };
        node_red_node_test_helper_1.default.load(kintone_1.default, flow, credentials, function () {
            var n1 = node_red_node_test_helper_1.default.getNode('n1');
            var n2 = node_red_node_test_helper_1.default.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    expect(msg.payload.totalCount).toBe('20');
                }
                catch (e) {
                    console.log(e);
                }
                done();
            });
            n1.receive({
                payload: null
            });
        });
    });
});
