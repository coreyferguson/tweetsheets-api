
const controller = require('../../../src/sheets/controller/sheetsController');
const { expect, sinon } = require('../../support/TestUtils');
const ymlParser = require('../../../src/core/ymlParser');
const path = require('path');

// mock data
const ymlToJson = fileName =>
  ymlParser.parse(path.join(__dirname, `mockData/${fileName}.yml`));
const mockData = JSON.stringify({
  findSheetRequest: ymlToJson('findSheetRequest'),
  tweetRequest: ymlToJson('tweetRequest')
});
const mock = key => JSON.parse(mockData)[key];

describe('sheetsController unit tests', () => {

  const sandbox = sinon.sandbox.create();

  beforeEach(() => {
    sandbox.stub(console, 'info');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('tweet', () => {

    it('statusCode: 401 - no credentials', () => {
      const event = mock('tweetRequest');
      delete event.headers.Cookie;
      const response = { statusCode: 200 };
      return controller.tweet(event, response).then(() => {
        expect(response.statusCode).to.equal(401);
      });
    });

    it('statusCode: 403 - invalid credentials');

    it('statusCode: 403 - cannot fetch another users userSheet', () => {
      const event = mock('tweetRequest');
      const body = JSON.parse(event.body);
      body.userId = 'someOtherUserId';
      event.body = JSON.stringify(body);
      const response = { statusCode: 200 };
      return controller.tweet(event, response).then(() => {
        expect(response.statusCode).to.equal(403);
      });
    });

    it('missing userId query parameter but authenticated; use session', () => {
      const event = mock('tweetRequest');
      const body = JSON.parse(event.body);
      delete body.userId;
      event.body = JSON.stringify(body);
      sandbox.stub(controller._userSheetService, 'tweet')
        .returns(Promise.resolve('userSheetValue'));
      const response = { statusCode: 200 };
      return controller.tweet(event, response).then(() => {
        expect(response.statusCode).to.eql(200);
      });
    });

    it('statusCode: 400 - missing required sheetId query parameter', () => {
      const event = mock('tweetRequest');
      const body = JSON.parse(event.body);
      delete body.sheetId;
      event.body = JSON.stringify(body);
      const response = { statusCode: 200 };
      return controller.tweet(event, response).then(() => {
        expect(response.statusCode).to.eql(400);
        expect(response.body.message).to.match(/sheetId/);
      });
    });

    it('tweeted successfully or currently throttled', () => {
      sandbox.stub(controller._userSheetService, 'tweet')
        .returns(Promise.resolve('userSheetValue'));
      const response = { statusCode: 200 };
      return controller.tweet(mock('tweetRequest'), response).then(() => {
        expect(response.statusCode).to.eql(200);
        expect(response.body).to.eql('userSheetValue');
      });
    });

  });

  describe('findOne', () => {

    it('get generic sheet data when unauthenticated', () => {
      sandbox.stub(controller._userService, 'isAuthenticated')
        .returns(Promise.resolve(false));
      sandbox.stub(controller._userSheetService, 'findOne')
        .returns(Promise.resolve('userSheetValue'));
      sandbox.stub(controller._sheetService, 'findOne')
        .returns(Promise.resolve('sheetValue'));
      const response = { statusCode: 200 };
      return controller.findOne(mock('findSheetRequest'), response).then(() => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.sheet).to.equal('sheetValue');
      });
    });

    it('get user sheet data when authenticated', () => {
      sandbox.stub(controller._userService, 'isAuthenticated')
        .returns(Promise.resolve(true));
      sandbox.stub(controller._userSheetService, 'findOne')
        .returns(Promise.resolve('userSheetValue'));
      sandbox.stub(controller._sheetService, 'findOne')
        .returns(Promise.resolve('sheetValue'));
      const response = { statusCode: 200 };
      return controller.findOne(mock('findSheetRequest'), response).then(() => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.equal('userSheetValue');
      });
    });

  });

});
