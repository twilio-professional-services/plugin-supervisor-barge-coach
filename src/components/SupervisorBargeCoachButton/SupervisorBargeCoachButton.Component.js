import * as React from 'react';
import { TaskHelper } from '@twilio/flex-ui';

import { syncClient, conferenceClient } from '../../services';
import { logger } from '../../utils';
import { ButtonContainer, buttonStyle, buttonStyleActive } from './SupervisorBargeCoachButton.Style';
import AbstractSyncComponent from '../AbstractSyncComponent';
import { Button } from '../Button';

export default class SupervisorBargeCoachButton extends AbstractSyncComponent {
  #listenerAdded = false;

  /**
   * Wait for an agentSid to become available and then set up the doc listener once
   */
  componentDidUpdate = async () => {
    // Setup the listener if it hasn't already and we have an agentSid
    if (!this.#listenerAdded && this.props.agentWorkerSid) {
      this.#listenerAdded = true;
      await this.setupListener(`syncDoc.${this.props.agentWorkerSid}`, this.onDocUpdated);
    }
  };

  /*
   * Render the coach and barge-in buttons, disable if the call isn't live or
   * if the supervisor isn't monitoring the call, toggle the icon based on coach and barge-in status
   */
  render() {
    const {
      muted,
      mutingLoading,
      barge,
      bargingLoading,
      enableBargeinButton,
      coaching,
      coachingLoading,
      enableCoachButton,
      task,
      disableAllButtons,
    } = this.props;
    const isLiveCall = TaskHelper.isLiveCall(task);

    return (
      <ButtonContainer>
        <Button
          loading={mutingLoading}
          icon={muted ? 'MuteLargeBold' : 'MuteLarge'}
          disabled={
            !isLiveCall || !enableBargeinButton || !enableCoachButton || (!barge && !coaching) || disableAllButtons
          }
          onClick={this.asyncToggleMuteHandler}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={muted ? 'Unmute' : 'Mute'}
          style={buttonStyle}
        />
        <Button
          loading={bargingLoading}
          icon={barge ? `IncomingCallBold` : 'IncomingCall'}
          disabled={!isLiveCall || !enableBargeinButton || disableAllButtons}
          onClick={this.asyncBargeHandleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={barge ? 'Barge-Out' : 'Barge-In'}
          style={barge ? buttonStyleActive : buttonStyle}
        />
        <Button
          loading={coachingLoading}
          icon={coaching ? `DefaultAvatarBold` : `DefaultAvatar`}
          disabled={!isLiveCall || !enableCoachButton || disableAllButtons}
          onClick={this.asyncCoachHandleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={coaching ? 'Disable Coach Mode' : 'Enable Coach Mode'}
          style={coaching ? buttonStyleActive : buttonStyle}
        />
      </ButtonContainer>
    );
  }

  /**
   * A wrapper for invoking an action that handles setting the loader and error animations
   * @param key loading key
   * @param action the action
   */
  actionAsyncHandler = async (key, action) => {
    const loadingKey = `${key}Loading`;
    this.props.setBargeCoachStatus({ [loadingKey]: true });
    try {
      await action();
    } finally {
      this.props.setBargeCoachStatus({ [loadingKey]: false });
    }
  };

  asyncToggleMuteHandler = () => this.actionAsyncHandler('muting', this.toggleMuteHandle);

  asyncBargeHandleClick = () => this.actionAsyncHandler('barging', this.bargeHandleClick);

  asyncCoachHandleClick = () => this.actionAsyncHandler('coaching', this.coachHandleClick);

  /**
   * Unmuates (enables) the participant
   */
  unmuteParticipant = async () => {
    await conferenceClient.unmuteParticipant(this.conferenceSid, this.supervisorParticipant.key);
    this.props.setBargeCoachStatus({ muted: false });
  };

  /**
   * Mutes (disables) the participant
   */
  muteParticipant = async () => {
    await conferenceClient.muteParticipant(this.conferenceSid, this.supervisorParticipant.key);
    this.props.setBargeCoachStatus({ muted: true });
  };

  /**
   * Toggles the mute/unmute of the participant
   */
  toggleMuteHandle = async () => {
    logger.log('Handling mute button toggle');

    if (!this.supervisorParticipant?.key) {
      logger.log('supervisorParticipant is null, skipping bargeHandleClick');
      return;
    }

    if (this.props.muted) {
      await this.unmuteParticipant();
    } else {
      await this.muteParticipant();
    }
  };

  /**
   * Enable Barge
   */
  bargeIn = async () => {
    await this.unmuteParticipant();
    this.props.setBargeCoachStatus({
      muted: this.props.muted,
      barge: true,
      coaching: false,
    });
  };

  /**
   * Disable Barge
   */
  bargeOut = async () => {
    await this.muteParticipant();
    this.props.setBargeCoachStatus({
      muted: false,
      barge: false,
      coaching: false,
    });
  };

  /*
   * On click we will be pulling the conference Sid and supervisor Sid
   * to trigger Mute / Unmute respectively for that user - muted comes from the redux store
   * We've built in resiliency if the supervisor refreshes their browser
   * or clicks monitor/un-monitor multiple times, it still confirms that
   * we allow the correct user to barge-in on the call
   */
  bargeHandleClick = async () => {
    logger.log('Handling Barge button toggle');

    if (!this.supervisorParticipant?.key) {
      logger.log('supervisorParticipant is null, skipping bargeHandleClick');
      return;
    }

    // Barge-in will "unmute" their line if the are muted, else "mute" their line if they are unmuted
    if (this.props.barge) {
      await this.bargeOut();
    } else {
      if (this.props.coaching) {
        await this.disableCoaching();
      }

      await this.bargeIn();
    }
  };

  /**
   * Disables coaching
   */
  disableCoaching = async () => {
    const { agentWorkerSid, supervisorFullName } = this.props;
    const { supervisorParticipant, agentParticipant, conferenceSid } = this;

    await conferenceClient.disableCoaching(conferenceSid, supervisorParticipant.key, agentParticipant.key);
    this.props.setBargeCoachStatus({
      coaching: false,
      muted: true,
      barge: false,
    });
    // Updating the Sync Doc to reflect that we are no longer coaching and back into Monitoring
    await syncClient.initSyncDoc(agentWorkerSid, conferenceSid, supervisorFullName, 'is Monitoring', 'remove');
  };

  /**
   * Enables coaching
   */
  enableCoaching = async () => {
    const { agentWorkerSid, supervisorFullName } = this.props;
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
      await syncClient.initSyncDoc(agentWorkerSid, conferenceSid, supervisorFullName, 'is Coaching', 'add');
    }
  };

  /*
   * On click we will be pulling the conferenceSid and supervisorSid
   * to trigger Mute / Unmute respectively for that user
   * We've built in resiliency if the supervisor refreshes their browser
   * or clicks monitor/un-monitor multiple times, it still confirms that
   * we allow the correct worker to coach on the call
   */
  coachHandleClick = async () => {
    logger.log('Handling Coach button toggle');

    const { supervisorParticipant, agentParticipant } = this;
    if (!supervisorParticipant?.key || !agentParticipant?.key) {
      logger.log('supervisorParticipant or agentParticipant is null, skipping coachHandleClick');
      return;
    }
    logger.log(`Current agentWorker is ${this.props.agentWorkerSid}`);

    // Coaching will "enable" their line if they are disabled, else "disable" their line if they are enabled
    if (this.props.coaching) {
      await this.disableCoaching();
    } else {
      if (this.props.barge) {
        await this.muteParticipant();
      }

      await this.enableCoaching();
    }
  };

  /**
   * Listen to doc update and when the agent wraps up the call, cleanup the state
   * @param doc the doc to listen on
   */
  onDocUpdated = (doc) => {
    const supervisors = doc.value.data.supervisors || [];

    // If isLocal is false, then it is invoked by the agent, i.e. it is the wrapup event so cleanup the status
    if (doc.isLocal === false && supervisors.length === 0) {
      this.props.resetBargeCoachStatus();
    }
  };

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
    const { muted, myWorkerSid } = this.props;
    const children = this.props.task?.conference?.source?.children || [];
    const participant = children.find(
      (p) =>
        p.value.participant_type === 'supervisor' && p.value.status === 'joined' && myWorkerSid === p.value.worker_sid,
    );
    logger.log(`Current supervisor is ${participant?.key} with status ${muted ? 'muted' : 'unmuted'}`);

    return participant;
  }

  /*
   * Pulling the agent Sid that we will be coaching on this conference
   * Ensuring they are a worker (IE agent) and it matches the agentWorkerSid we pulled from the props
   */
  get agentParticipant() {
    const children = this.props.task?.conference?.source?.children || [];
    const participant = children.find(
      (p) => p.value.participant_type === 'worker' && this.props.agentWorkerSid === p.value.worker_sid,
    );

    logger.log(`Current agentWorker is ${participant?.key}`);

    return participant;
  }
}
