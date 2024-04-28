import { CRequest } from 'src/web-client/crequest';
import { CResponse } from 'src/web-client/cresponse';
import { WebClientException } from 'src/web-client/exceptions/web-client-exception';

describe('web client exception', () => {
  test('properties', () => {
    const message = 'message';
    const request = new CRequest('GET', 'unknown://invalid uri/', '', {});
    const response = new CResponse(200, '', {});
    const previous = new Error('an error');

    const exception = new WebClientException(message, request, response, previous);

    expect(exception.message).toBe(message);
    expect(exception.getRequest()).toBe(request);
    expect(exception.getResponse()).toBe(response);
    expect(exception.getPrevious()).toBe(previous);
  });
});
