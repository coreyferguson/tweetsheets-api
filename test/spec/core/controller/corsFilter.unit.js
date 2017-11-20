
const corsFilter = require('../../../../core/controller/corsFilter');
const { expect, sinon } = require('../../../support/TestUtils');

describe('corsFilter unit tests', () => {

  const defaultHeaders = {
    'Access-Control-Allow-Origin': 'https://tweetsheets-test.overattribution.com',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  let sandbox = sinon.sandbox.create();

  before(() => {
    sandbox.stub(console, 'info');
  });

  after(() => {
    sandbox.restore();
  });

  it('does not overwrite any existing headers', () => {
    const response = {
      statusCode: 200,
      headers: { 'existingHeaderLabel': 'existingHeaderValue' }
    };
    return corsFilter.process(
      { headers: { origin: 'https://tweetsheets-test.overattribution.com' } },
      response
    ).then(shouldContinue => {
      expect(shouldContinue).to.be.true;
      expect(response).to.eql({
        statusCode: 200,
        headers: Object.assign(
          { 'existingHeaderLabel': 'existingHeaderValue' },
          defaultHeaders
        )
      });
    });
  });

  it('is not an allowed origin', () => {
    const response = { statusCode: 200 };
    return corsFilter.process(
      { headers: { origin: 'https://notmydomain.com' } },
      response
    ).then(shouldContinue => {
      expect(shouldContinue).to.be.true;
      expect(response).to.eql({
        statusCode: 200,
        headers: defaultHeaders
      });
    });
  });

  it('is default origin', () => {
    const response = { statusCode: 200 };
    return corsFilter.process(
      { headers: { origin: 'https://tweetsheets-test.overattribution.com' } },
      response
    ).then(shouldContinue => {
      expect(shouldContinue).to.be.true;
      expect(response).to.eql({
        statusCode: 200,
        headers: defaultHeaders
      });
    });
  });

  it('is alternative origin', () => {
    const response = { statusCode: 200 };
    return corsFilter.process(
      { headers: { origin: 'https://tweetsheets-test2.overattribution.com:3000' } },
      response
    ).then(shouldContinue => {
      expect(shouldContinue).to.be.true;
      expect(response).to.eql({
        statusCode: 200,
        headers: Object.assign(
          {},
          defaultHeaders,
          {
            'Access-Control-Allow-Origin':
              'https://tweetsheets-test2.overattribution.com:3000',
          }
        )
      });
    });
  });

  it('header is `Origin` with uppercase O', () => {
    const response = { statusCode: 200 };
    return corsFilter.process(
      { headers: { Origin: 'https://tweetsheets-test.overattribution.com' } },
      response
    ).then(shouldContinue => {
      expect(shouldContinue).to.be.true;
      expect(response).to.eql({
        statusCode: 200,
        headers: defaultHeaders
      });
    });
  });

  it('origin header with lower and upper case');

});
