import * as React from 'react';
import { IconButton, TaskHelper } from '@twilio/flex-ui';

import { syncClient, conferenceClient } from '../../services';
import { logger } from '../../utils';
import { ButtonContainer, buttonStyle, buttonStyleActive } from './SupervisorBargeCoachButton.Style';

export default class SupervisorBargeCoachButton extends React.Component {
  /**
   * Fetches the conferenceSid from the task event
   * @return {any}
   */
  get conferenceSid() {
    return this.props.task?.conference?.conferenceSid;
  }

  /*
   * Checking the conference within the task for a participant with the value "supervisor",
   * is their status "joined", reason for this is every time you click monitor/unmonitor on a call
   * it creates an additional participant, the previous status will show as "left", we only want the active supervisor,
   * and finally we want to ensure that the supervisor that is joined also matches their worker_sid
   * which we pull from mapStateToProps at the bottom of this js file
   */
  get supervisorParticipant() {
    const { muted, myWorkerSID } = this.props;
    const children = this.props.task?.conference?.source?.children || [];
    const participant = children.find(
      (p) =>
        p.value.participant_type === 'supervisor' && p.value.status === 'joined' && myWorkerSID === p.value.worker_sid,
    );
    logger.log(`Current supervisorSid is ${participant?.key} with status ${muted}`);

    return participant;
  }

  /*
   * Pulling the agentSID that we will be coaching on this conference
   * Ensuring they are a worker (IE agent) and it matches the agentWorkerSID we pulled from the props
   */
  get agentParticipant() {
    const children = this.props.task?.conference?.source?.children || [];
    const participant = children.find(
      (p) => p.value.participant_type === 'worker' && this.props.agentWorkerSID === p.value.worker_sid,
    );

    logger.log(`Current agentWorkerSid is ${participant?.key}`);

    return participant;
  }

  /**
   * Enables the participant
   */
  #unmuteParticipant = async () => {
    await conferenceClient.unmuteParticipant(this.conferenceSid, this.supervisorParticipant.key);
    if (this.props.coaching) {
      this.props.setBargeCoachStatus({
        muted: false,
        barge: false,
      });
    } else {
      this.props.setBargeCoachStatus({
        muted: false,
        barge: true,
      });
    }
  };

  /**
   * Mutes the participant
   * @return {Promise<void>}
   */
  #muteParticipant = async () => {
    await conferenceClient.muteParticipant(this.conferenceSid, this.supervisorParticipant.key);
    if (this.props.coaching) {
      this.props.setBargeCoachStatus({
        muted: true,
        barge: false,
      });
    } else {
      this.props.setBargeCoachStatus({
        muted: true,
        barge: true,
      });
    }
  };

  /*
   * On click we will be pulling the conference SID and supervisorSID
   * to trigger Mute / Unmute respectively for that user - muted comes from the redux store
   * We've built in resiliency if the supervisor refreshes their browser
   * or clicks monitor/un-monitor multiple times, it still confirms that
   * we allow the correct user to barge-in on the call
   */
  bargeHandleClick = async () => {
    logger.log('Handling Barge button toggle');

    if (this.supervisorParticipant?.key === null) {
      logger.log('supervisorParticipant is null, skipping bargeHandleClick');
      return;
    }

    /*
     * Barge-in will "unmute" their line if the are muted, else "mute" their line if they are unmuted
     * Also account for coach status to enable/disable barge as we call this when clicking the mute/unmute button
     */
    if (this.props.muted) {
      await this.#unmuteParticipant();
    } else {
      await this.#muteParticipant();
    }
  };

  /**
   * Disables coaching
   */
  #disableCoaching = async () => {
    const { agentWorkerSID, supervisorFullName } = this.props;
    const { supervisorParticipant, agentParticipant, conferenceSid } = this;

    await conferenceClient.disableCoaching(conferenceSid, supervisorParticipant.key, agentParticipant.key);
    this.props.setBargeCoachStatus({
      coaching: false,
      muted: true,
      barge: false,
    });
    // Updating the Sync Doc to reflect that we are no longer coaching and back into Monitoring
    await syncClient.initSyncDoc(agentWorkerSID, conferenceSid, supervisorFullName, 'is Monitoring', 'remove');
  };

  /**
   * Enables coaching
   */
  #enableCoaching = async () => {
    const { agentWorkerSID, supervisorFullName } = this.props;
    const { supervisorParticipant, agentParticipant, conferenceSid } = this;

    await conferenceClient.enableCoaching(conferenceSid, supervisorParticipant.key, agentParticipant.key);
    this.props.setBargeCoachStatus({
      coaching: true,
      muted: false,
      barge: false,
    });

    // If coachingStatusPanel is true (enabled), proceed otherwise we will need to subscribe to the Sync Doc
    if (this.props.coachingStatusPanel) {
      // Updating the Sync Doc to reflect that we are now coaching the agent
      await syncClient.initSyncDoc(agentWorkerSID, conferenceSid, supervisorFullName, 'is Coaching', 'add');
    }
  };

  /*
   * On click we will be pulling the conference SID and supervisorSID
   * to trigger Mute / Unmute respectively for that user
   * We've built in resiliency if the supervisor refreshes their browser
   * or clicks monitor/un-monitor multiple times, it still confirms that
   * we allow the correct worker to coach on the call
   */
  coachHandleClick = async () => {
    logger.log('Handling Coach button toggle');

    if (this.supervisorParticipant?.key === null || this.agentParticipant?.key === null) {
      logger.log('supervisorParticipant or agentParticipant is null, skipping coachHandleClick');
      return;
    }
    logger.log(`Current workerSid is ${this.props.agentWorkerSID}`);

    // Coaching will "enable" their line if they are disabled, else "disable" their line if they are enabled
    if (this.props.coaching) {
      await this.#disableCoaching();
    } else {
      await this.#enableCoaching();
    }
  };

  /*
   * Render the coach and barge-in buttons, disable if the call isn't live or
   * if the supervisor isn't monitoring the call, toggle the icon based on coach and barge-in status
   */
  render() {
    const { muted, barge, enableBargeinButton, coaching, enableCoachButton, task } = this.props;
    const isLiveCall = TaskHelper.isLiveCall(task);

    return (
      <ButtonContainer>
        <IconButton
          icon={muted ? 'MuteLargeBold' : 'MuteLarge'}
          disabled={!isLiveCall || !enableBargeinButton || !enableCoachButton || (!barge && !coaching)}
          onClick={this.bargeHandleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={muted ? 'Unmute' : 'Mute'}
          style={buttonStyle}
        />
        <IconButton
          icon={barge ? `IncomingCallBold` : 'IncomingCall'}
          disabled={!isLiveCall || !enableBargeinButton || coaching}
          onClick={this.bargeHandleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={barge ? 'Barge-Out' : 'Barge-In'}
          style={barge ? buttonStyleActive : buttonStyle}
        />
        <IconButton
          icon={coaching ? `DefaultAvatarBold` : `DefaultAvatar`}
          disabled={!isLiveCall || !enableCoachButton}
          onClick={this.coachHandleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={coaching ? 'Disable Coach Mode' : 'Enable Coach Mode'}
          style={coaching ? buttonStyleActive : buttonStyle}
        />
      </ButtonContainer>
    );
  }
}
