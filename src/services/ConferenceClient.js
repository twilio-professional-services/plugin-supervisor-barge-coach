import { Manager } from '@twilio/flex-ui';

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
   * We are calling the mute-unmute-participant Twilio function
   * passing the conferenceSID, the participantSID, and
   * flip them from mute/unmute respectively when clicking the button
   */
  #toggleParticipantMute = async (conference, participantSid, muted) => {
    await this.#post('mute-unmute-participant', {
      conference,
      participant: participantSid,
      muted,
    });
    console.log(`${muted ? 'Muting' : 'Unmuting'} successful for participant`, participantSid);
  };

  /*
   * We are calling the coaching Twilio function
   * passing the conferenceSID, the participantSID, and
   * flip them from disable/enable coaching respectively when clicking the button
   */
  #toggleParticipantCoaching = async (conference, participantSid, muted, coaching, agentSid) => {
    console.log(
      `Passing conference: ${conference}, supervisor: ${participantSid}, and agent: ${agentSid} to the coaching Twilio function as ${coaching}`,
    );

    await this.#post('coaching', {
      conference,
      participant: participantSid,
      muted,
      coaching,
      agentSid,
    });

    console.log(`${coaching ? 'Enabling Coach' : 'Disabling Coach'} successful for participant`, participantSid);
  };

  // Calling to toggle mute status to true (mute)
  muteParticipant = async (conference, participantSid) => {
    return this.#toggleParticipantMute(conference, participantSid, true);
  };

  // Calling to toggle mute status to false (unmute)
  unmuteParticipant = async (conference, participantSid) => {
    return this.#toggleParticipantMute(conference, participantSid, false);
  };

  // Calling to toggle coaching status to true (enable coaching) and toggle mute to false
  enableCoaching = async (conference, participantSid, agentSid) => {
    return this.#toggleParticipantCoaching(conference, participantSid, false, true, agentSid);
  };

  // Calling to toggle coaching status to false (disable coaching) and toggle mute to true
  disableCoaching = async (conference, participantSid, agentSid) => {
    return this.#toggleParticipantCoaching(conference, participantSid, true, false, agentSid);
  };
}

const conferenceClient = new ConferenceClient(Manager.getInstance());

export default conferenceClient;
