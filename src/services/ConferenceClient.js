import { Manager } from '@twilio/flex-ui';

import { logger, notifications } from '../utils';

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
  #post = async (path, params, errorNotification) => {
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

    try {
      const resp = await fetch(`${process.env.REACT_APP_SERVICE_BASE_URL}/${path}`, options);
      return resp.json();
    } catch (e) {
      notifications.error(errorNotification);
      throw e;
    }
  };

  /*
   * We are calling the mute-unmute-participant Twilio Function passing the conferenceSid, the participantSid, and
   * flip them from mute/unmute respectively when clicking the button
   */
  #toggleParticipantMute = async (conferenceSid, participantSid, muted) => {
    const action = muted ? 'Muting' : 'Unmuting';
    logger.log(`${action} participant on conference ${conferenceSid} with supervisor ${participantSid}`);

    await this.#post(
      'mute-unmute-participant',
      {
        conferenceSid,
        participantSid,
        muted,
      },
      `Could not ${muted ? 'mute' : 'unmute'} participant. Please try again later.`,
    );
    logger.log(`${action} successful for participant`, participantSid);
  };

  /*
   * We are calling the coaching Twilio function passing the conferenceSid, the participantSid, and
   * flip them from disable/enable coaching respectively when clicking the button
   */
  #toggleParticipantCoaching = async (conferenceSid, participantSid, coaching, agentSid) => {
    const action = coaching ? 'Enabling Coach' : 'Disabling Coach';
    logger.log(`${action} on conference ${conferenceSid} between coach ${participantSid} and agent ${agentSid}`);

    await this.#post(
      'coaching',
      {
        conferenceSid,
        participantSid,
        coaching,
        agentSid,
      },
      `Could not ${coaching ? 'enable' : 'disable'} coaching. Please try again later.`,
    );

    logger.log(`${action} successful for participant`, participantSid);
  };

  /**
   * Calling to toggle mute status to true (mute)
   * @param conferenceSid the conference to unmute
   * @param participantSid the participantSid (the supervisor)
   */
  muteParticipant = async (conferenceSid, participantSid) => {
    return this.#toggleParticipantMute(conferenceSid, participantSid, true);
  };

  /**
   * Calling to toggle mute status to false (unmute)
   * @param conferenceSid the conference to unmute
   * @param participantSid the participantSid (the supervisor)
   */
  unmuteParticipant = async (conferenceSid, participantSid) => {
    return this.#toggleParticipantMute(conferenceSid, participantSid, false);
  };

  /**
   *  Calling to toggle coaching status to true (enable coaching) and toggle mute to false
   * @param conferenceSid the conference to disable coaching on
   * @param participantSid the participantSid (the supervisor)
   * @param agentSid the agentSid
   */
  enableCoaching = async (conferenceSid, participantSid, agentSid) => {
    return this.#toggleParticipantCoaching(conferenceSid, participantSid, true, agentSid);
  };

  /**
   * Calling to toggle coaching status to false (disable coaching) and toggle mute to true
   * @param conferenceSid the conference to disable coaching on
   * @param participantSid the participantSid (the supervisor)
   * @param agentSid the agentSid
   */
  disableCoaching = async (conferenceSid, participantSid, agentSid) => {
    return this.#toggleParticipantCoaching(conferenceSid, participantSid, false, agentSid);
  };
}

const conferenceClient = new ConferenceClient(Manager.getInstance());

export default conferenceClient;
