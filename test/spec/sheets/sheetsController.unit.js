
const controller = require('../../../sheets/controller/sheetsController');
const { expect, sinon } = require('../../support/TestUtils');
const ymlParser = require('../../../core/ymlParser');
const path = require('path');

// mock data
const ymlToJson = fileName =>
  ymlParser.parse(path.join(__dirname, `mockData/${fileName}.yml`));
const mockData = JSON.stringify({
  tweetRequest: ymlToJson('tweetRequest')
});
const mock = key => JSON.parse(mockData)[key];

describe('sheetsController unit tests', () => {

  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('statusCode: 401 - no credentials', () => {
    const event = mock('tweetRequest');
    delete event.headers.Cookie;
    return expect(controller.tweet(event))
      .to.eventually.have.property('statusCode', 401);
  });

  it('statusCode: 403 - invalid credentials');

  it('statusCode: 403 - cannot fetch another users userSheet', () => {
    const event = mock('tweetRequest');
    const body = JSON.parse(event.body);
    body.userId = 'someOtherUserId';
    event.body = JSON.stringify(body);
    return expect(controller.tweet(event))
      .to.eventually.have.property('statusCode', 403);
  });

  it('missing userId query parameter but authenticated; use session', () => {
    const event = mock('tweetRequest');
    const body = JSON.parse(event.body);
    delete body.userId;
    event.body = JSON.stringify(body);
    sandbox.stub(controller._userSheetService, 'tweet')
      .returns(Promise.resolve('userSheetValue'));
    return controller.tweet(event).then(response => {
      expect(response.statusCode).to.eql(200);
    });
  });

  it('statusCode: 400 - missing required sheetId query parameter', () => {
    const event = mock('tweetRequest');
    const body = JSON.parse(event.body);
    delete body.sheetId;
    event.body = JSON.stringify(body);
    return controller.tweet(event).then(response => {
      expect(response.statusCode).to.eql(400);
      expect(response.body).to.match(/sheetId/);
    });
  });

  it('tweeted successfully or currently throttled', () => {
    sandbox.stub(controller._userSheetService, 'tweet')
      .returns(Promise.resolve('userSheetValue'));
    return controller.tweet(mock('tweetRequest')).then(res => {
      const body = JSON.parse(res.body);
      expect(res.statusCode).to.eql(200);
      expect(body.userSheet).to.eql('userSheetValue');
    });
  });

});
