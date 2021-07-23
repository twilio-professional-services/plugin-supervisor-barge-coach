/*
 * Using the TokenValidator to authenticate so we can query the API
 * We could do this directly from the plugin, but that requires us to provide
 * the AccoundSID and AuthToken, which we do not want to have leak into the front end
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
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Passed in conference SID, Participant SID we are changing, muted status, and if we are enabling or disabling coaching
  const { conference, participant, muted, coaching, agentSid } = event;

  const client = context.getTwilioClient();

  // We first have to toggle the Coaching status to true/false and pass in the agent sid we are coaching
  try {
    const participantResponse = await client.conferences(conference).participants(participant).update({
      coaching,
      callSidToCoach: agentSid,
    });
    response.setBody({
      status: 200,
      participantResponse,
    });
    console.log(
      `Updating participant: ${participant} in conference: ${conference}, coaching status is ${coaching} - agent we are coaching ${agentSid}`,
    );
  } catch (error) {
    console.error(error);
    response.setBody({
      status: error.status || 500,
      error,
    });
    response.setStatusCode(error.status || 500);
  }
  // Once we have set the coaching status, we can now unmute our line
  try {
    const participantResponse = await client.conferences(conference).participants(participant).update({ muted });
    response.setBody({
      status: 200,
      participantResponse,
    });
    console.log(`Setting Mute to ${muted}.`);
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
