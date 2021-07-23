import { Manager } from '@twilio/flex-ui';

import { request } from './request';

class ConferenceService {
  manager = Manager.getInstance();

  /*
   * We are calling the mute-unmute-participant Twilio function
   * passing the conferenceSID, the participantSID, and
   * flip them from mute/unmute respectively when clicking the button
   */
  _toggleParticipantMute = (conference, participantSid, muted) => {
    return new Promise((resolve, reject) => {
      request('mute-unmute-participant', this.manager, {
        conference,
        participant: participantSid,
        muted,
      })
        .then(() => {
          console.log(`${muted ? 'Muting' : 'Unmuting'} successful for participant`, participantSid);
          resolve();
        })
        .catch((error) => {
          console.error(`Error ${muted ? 'Muting' : 'Unmuting'} participant ${participantSid}\r\n`, error);
          reject(error);
        });
    });
  };

  // Calling to toggle mute status to true (mute)
  muteParticipant = (conference, participantSid) => {
    return this._toggleParticipantMute(conference, participantSid, true);
  };

  // Calling to toggle mute status to false (unmute)
  unmuteParticipant = (conference, participantSid) => {
    return this._toggleParticipantMute(conference, participantSid, false);
  };

  /*
   * We are calling the coaching Twilio function
   * passing the conferenceSID, the participantSID, and
   * flip them from disable/enable coaching respectively when clicking the button
   */
  _toggleParticipantCoaching = (conference, participantSid, muted, coaching, agentSid) => {
    console.log(
      `Passing conference: ${conference}, supervisor: ${participantSid}, and agent: ${agentSid} to the coaching Twilio function as ${coaching}`,
    );
    return new Promise((resolve, reject) => {
      request('coaching', this.manager, {
        conference,
        participant: participantSid,
        muted,
        coaching,
        agentSid,
      })
        .then(() => {
          console.log(`${coaching ? 'Enabling Coach' : 'Disabling Coach'} successful for participant`, participantSid);
          resolve();
        })
        .catch((error) => {
          console.error(
            `Error ${coaching ? 'Enabling Coach' : 'Disabling Coach'} participant ${participantSid}\r\n`,
            error,
          );
          reject(error);
        });
    });
  };

  // Calling to toggle coaching status to true (enable coaching) and toggle mute to false
  enableCoaching = (conference, participantSid, agentSid) => {
    return this._toggleParticipantCoaching(conference, participantSid, false, true, agentSid);
  };

  // Calling to toggle coaching status to false (disable coaching) and toggle mute to true
  disableCoaching = (conference, participantSid, agentSid) => {
    return this._toggleParticipantCoaching(conference, participantSid, true, false, agentSid);
  };
}

export default new ConferenceService();
