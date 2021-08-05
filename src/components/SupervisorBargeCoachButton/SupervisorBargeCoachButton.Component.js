import * as React from 'react';
import { IconButton, TaskHelper } from '@twilio/flex-ui';

import { syncClient, conferenceClient } from '../../services';
import { logger } from '../../utils';
import { ButtonContainer, buttonStyle, buttonStyleActive } from './SupervisorBargeCoachButton.Style';

export default class SupervisorBargeCoachButton extends React.Component {
  /*
   * On click we will be pulling the conference SID and supervisorSID
   * to trigger Mute / Unmute respectively for that user - muted comes from the redux store
   * We've built in resiliency if the supervisor refreshes their browser
   * or clicks monitor/un-monitor multiple times, it still confirms that
   * we allow the correct user to barge-in on the call
   */
  bargeHandleClick = async () => {
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSID = conference && conference.conferenceSid;
    const { muted } = this.props;
    const conferenceChildren = conference?.source?.children || [];
    const { coaching } = this.props;

    /*
     * Checking the conference within the task for a participant with the value "supervisor",
     * is their status "joined", reason for this is every time you click monitor/unmonitor on a call
     * it creates an additional participant, the previous status will show as "left", we only want the active supervisor,
     * and finally we want to ensure that the supervisor that is joined also matches their worker_sid
     * which we pull from mapStateToProps at the bottom of this js file
     */
    const supervisorParticipant = conferenceChildren.find(
      (p) =>
        p.value.participant_type === 'supervisor' &&
        p.value.status === 'joined' &&
        this.props.myWorkerSID === p.value.worker_sid,
    );
    logger.log(`Current supervisorSID = ${supervisorParticipant.key} ${muted}`);

    /*
     * If the supervisorParticipant.key is null return, this would be rare and best practice to include this
     * before calling any function you do not want to send it null values unless your function is expecting that
     */
    if (supervisorParticipant.key === null) {
      logger.log('supervisorParticipant.key = null, returning');
      return;
    }
    /*
     * Barge-in will "unmute" their line if the are muted, else "mute" their line if they are unmuted
     * Also account for coach status to enable/disable barge as we call this when clicking the mute/unmute button
     */
    if (muted) {
      await conferenceClient.unmuteParticipant(conferenceSID, supervisorParticipant.key);
      if (coaching) {
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
    } else {
      await conferenceClient.muteParticipant(conferenceSID, supervisorParticipant.key);
      if (coaching) {
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
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSID = conference && conference.conferenceSid;
    const { coaching } = this.props;
    const conferenceChildren = conference?.source?.children || [];

    /*
     * Checking the conference within the task for a participant with the value "supervisor",
     * is their status "joined", reason for this is every time you click monitor/unmonitor on a call
     * it creates an additional participant, the previous status will show as "left", we only want the active supervisor,
     * and finally we want to ensure that the supervisor that is joined also matches their worker_sid
     * which we pull from mapStateToProps at the bottom of this js file
     */
    const supervisorParticipant = conferenceChildren.find(
      (p) =>
        p.value.participant_type === 'supervisor' &&
        p.value.status === 'joined' &&
        this.props.myWorkerSID === p.value.worker_sid,
    );
    logger.log(`Current supervisorSID = ${supervisorParticipant.key}`);

    /*
     * Pulling the agentSID that we will be coaching on this conference
     * Ensuring they are a worker (IE agent) and it matches the agentWorkerSID we pulled from the props
     */
    const agentParticipant = conferenceChildren.find(
      (p) => p.value.participant_type === 'worker' && this.props.agentWorkerSID === p.value.worker_sid,
    );

    logger.log(`Current agentWorkerSID = ${this.props.agentWorkerSID}`);
    logger.log(`Current agentSID = ${agentParticipant?.key}`);

    /*
     * If the agentParticipant.key or supervisorParticipant.key is null return, this would be rare and best practice to include this
     * before calling any function you do not want to send it null values unless your function is expecting that
     */
    if (
      !agentParticipant ||
      !supervisorParticipant ||
      agentParticipant.key === null ||
      supervisorParticipant.key === null
    ) {
      logger.log('agentParticipant.key or supervisorParticipant.key = null, returning');
      return;
    }
    // Coaching will "enable" their line if they are disabled, else "disable" their line if they are enabled
    if (coaching) {
      await conferenceClient.disableCoaching(conferenceSID, supervisorParticipant.key, agentParticipant.key);
      this.props.setBargeCoachStatus({
        coaching: false,
        muted: true,
        barge: false,
      });
      // Updating the Sync Doc to reflect that we are no longer coaching and back into Monitoring
      await syncClient.initSyncDoc(
        this.props.agentWorkerSID,
        conferenceSID,
        this.props.supervisorFN,
        'is Monitoring',
        'remove',
      );
    } else {
      await conferenceClient.enableCoaching(conferenceSID, supervisorParticipant.key, agentParticipant.key);
      this.props.setBargeCoachStatus({
        coaching: true,
        muted: false,
        barge: false,
      });

      /*
       * If coachingStatusPanel is true (enabled), proceed
       * otherwise we will not subscribe to the Sync Doc
       */
      const { coachingStatusPanel } = this.props;
      if (coachingStatusPanel) {
        // Updating the Sync Doc to reflect that we are now coaching the agent
        await syncClient.initSyncDoc(
          this.props.agentWorkerSID,
          conferenceSID,
          this.props.supervisorFN,
          'is Coaching',
          'add',
        );
      }
    }
  };

  /*
   * Render the coach and barge-in buttons, disable if the call isn't live or
   * if the supervisor isn't monitoring the call, toggle the icon based on coach and barge-in status
   */
  render() {
    const { muted } = this.props;
    const { barge } = this.props;
    const { enableBargeinButton } = this.props;
    const { coaching } = this.props;
    const { enableCoachButton } = this.props;

    const isLiveCall = TaskHelper.isLiveCall(this.props.task);

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
