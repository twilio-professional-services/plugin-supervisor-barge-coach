/* eslint-disable no-console */

/*
 * Using the TokenValidator to authenticate so we can query the API
 * We could do this directly from the plugin, but that requires us to provide
 * the AccountSid and AuthToken, which we do not want to have leak into the front end
 * This the #1 why we are query this via a function vs directly in the plugin!
 */

const TokenValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = TokenValidator(async (context, event, callback) => {
  /*
   * '*' allows being called from any origin, this not the best security
   * practice and should only be used for testing; when building
   * a production plugin you should set the allowed origin to
   * 'https://flex.twilio.com' (or any custom domain serving the plugin)
   */

  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Passed in conference Sid, Participant Sid we are changing, and if we are muting or unmuting
  const { conferenceSid, participantSid, muted } = event;

  console.log(
    `Updating participant ${participantSid} in conference ${conferenceSid}, toggling the mute status to ${muted}`,
  );

  try {
    const client = context.getTwilioClient();
    const participantResponse = await client.conferences(conferenceSid).participants(participantSid).update({ muted });
    response.setBody({
      status: 200,
      participantResponse,
    });
  } catch (error) {
    console.error(error);
    response.setBody({
      status: error.status || 500,
      error,
    });
    response.setStatusCode(error.status || 500);
  }

  return callback(null, response);
});
