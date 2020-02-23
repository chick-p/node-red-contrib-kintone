import helper from 'node-red-node-test-helper';
import nock from 'nock';
import { kintoneNode } from '../nodes/kintone';

helper.init(require.resolve('node-red'));
describe('kintone Node', () => {
  beforeEach((done) => {
    helper.startServer(done);
  });
  afterEach((done) => {
    nock.cleanAll();
    helper.unload();
    helper.stopServer(done);
  });

  it('should be loaded', (done) => {
    const flow = [{ id: 'n1', type: 'kintone', name: 'kintone' }];
    helper.load(kintoneNode, flow, () => {
      const n1 = helper.getNode('n1');
      expect(n1.name).toBe('kintone');
      done();
    });
  });
  it('should request to kintone', (done) => {
    nock('https://example.cybozu.com')
      .get('/k/v1/records.json')
      .reply(200, { totalCount: '20' });
    const flow = [
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
    const credentials = {
      n3: {
        domain: 'example.cybozu.com',
        username: 'foo',
        password: 'bar'
      }
    };

    helper.load(kintoneNode, flow, credentials, () => {
      const n1 = helper.getNode('n1');
      const n2 = helper.getNode('n2');
      n2.on('input', (msg) => {
        try {
          expect(msg.payload.totalCount).toBe('20');
        } catch(e) {
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
