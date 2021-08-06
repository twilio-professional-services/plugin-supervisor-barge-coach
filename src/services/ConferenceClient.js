import { Manager } from '@twilio/flex-ui';

import { logger } from '../utils';

class ConferenceClient {
  #manager;

  constructor(manager) {
    this.#manager = manager;
  }

  /**
   * Internal method to make a POST request
   * @param path  the path to post to
   * @param params the post parameters
   */
  #post = async (path, params) => {
    const body = {
      ...params,
      Token: this.#manager.store.getState().flex.session.ssoTokenPayload.token,
    };

    const options = {
      method: 'POST',
      body: new URLSearchParams(body),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    };

    const resp = await fetch(`${process.env.REACT_APP_SERVICE_BASE_URL}/${path}`, options);
    return resp.json();
  };

  /*
   * We are calling the mute-unmute-participant Twilio Function passing the conferenceSid, the participantSid, and
   * flip them from mute/unmute respectively when clicking the button
   */
  #toggleParticipantMute = async (conferenceSid, participantSid, muted) => {
    const action = muted ? 'Muting' : 'Unmuting';
    logger.log(`${action} participant on conference ${conferenceSid} with supervisor ${participantSid}`);

    await this.#post('mute-unmute-participant', {
      conferenceSid,
      participantSid,
      muted,
    });
    logger.log(`${action} successful for participant`, participantSid);
  };

  /*
   * We are calling the coaching Twilio function passing the conferenceSid, the participantSid, and
   * flip them from disable/enable coaching respectively when clicking the button
   */
  #toggleParticipantCoaching = async (conferenceSid, participantSid, muted, coaching, agentSid) => {
    const action = coaching ? 'Enabling Coach' : 'Disabling Coach';
    logger.log(`${action} on conference ${conferenceSid} between coach ${participantSid} and agent ${agentSid}`);

    await this.#post('coaching', {
      conferenceSid,
      participantSid,
      muted,
      coaching,
      agentSid,
    });

    logger.log(`${action} successful for participant`, participantSid);
  };

  // Calling to toggle mute status to true (mute)
  muteParticipant = async (conferenceSid, participantSid) => {
    return this.#toggleParticipantMute(conferenceSid, participantSid, true);
  };

  // Calling to toggle mute status to false (unmute)
  unmuteParticipant = async (conferenceSid, participantSid) => {
    return this.#toggleParticipantMute(conferenceSid, participantSid, false);
  };

  // Calling to toggle coaching status to true (enable coaching) and toggle mute to false
  enableCoaching = async (conferenceSid, participantSid, agentSid) => {
    return this.#toggleParticipantCoaching(conferenceSid, participantSid, false, true, agentSid);
  };

  // Calling to toggle coaching status to false (disable coaching) and toggle mute to true
  disableCoaching = async (conferenceSid, participantSid, agentSid) => {
    return this.#toggleParticipantCoaching(conferenceSid, participantSid, true, false, agentSid);
  };
}

const conferenceClient = new ConferenceClient(Manager.getInstance());

export default conferenceClient;
