import * as React from 'react';
import { IconButton, TaskHelper, withTheme } from '@twilio/flex-ui';
import styled from 'react-emotion';
import ConferenceService from '../services/ConferenceService';

// Used for Sync Docs
import { SyncDoc } from '../services/Sync'

// Used for the custom redux state
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions as BargeCoachStatusAction, } from '../states/BargeCoachState';
import { initialState } from '../states/BargeCoachState';

const ButtonContainer = styled('div')`
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
`;

const buttonStyleActive = {
  width: '44px',
  height: '44px',
  'marginLeft': '6px',
  'marginRight': '6px',
  'color': 'limegreen',
}

const buttonStyle = {
  width: '44px',
  height: '44px',
  'marginLeft': '6px',
  'marginRight': '6px'
}

class SupervisorBargeCoachButton extends React.Component {
  // getting props
  constructor(props) {
    super(props);
  }

  // Initial sync doc listener, will use this when calling the coachHandleClick
  // Pull values from props as we need to confirm we are updating the agent's sync doc
  // and adding the conference, supervisor, and coaching status
  initSyncDoc(agentWorkerSID, conferenceSID, supervisorFN, coaching) {
    const { task } = this.props;
    const docToUpdate = `syncDoc.${agentWorkerSID}`;

    // Updating the sync doc for the agent, this will be triggered only from coachHandleClick
    console.log(`Updating Sync Doc: ${docToUpdate}, with conference: ${conferenceSID}, supervisor coaching: ${supervisorFN}, and coaching status to: ${coaching}`);
    SyncDoc.updateSyncDoc(docToUpdate, conferenceSID, supervisorFN, coaching);
  }
  
  // On click we will be pulling the conference SID and supervisorSID
  // to trigger Mute / Unmute respectively for that user - muted comes from the redux store
  // We've built in resiliency if the supervisor refreshes their browser
  // or clicks monitor/un-monitor multiple times, it still confirms that
  // we allow the correct user to barge-in on the call
  bargeHandleClick = () => {
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSID = conference && conference.conferenceSid;
    const muted = this.props.muted;
    const conferenceChildren = conference?.source?.children || [];
    const coaching = this.props.coaching;

    // Checking the conference within the task for a participant with the value "supervisor", 
    // is their status "joined", reason for this is every time you click monitor/unmonitor on a call
    // it creates an additional participant, the previous status will show as "left", we only want the active supervisor, 
    // and finally we want to ensure that the supervisor that is joined also matches their worker_sid 
    // which we pull from mapStateToProps at the bottom of this js file
    const supervisorParticipant = conferenceChildren.find(p => p.value.participant_type === 'supervisor' 
      && p.value.status === 'joined' 
      && this.props.myWorkerSID === p.value.worker_sid);
    console.log(`Current supervisorSID = ${supervisorParticipant.key}`);

    // If the supervisorParticipant.key is null return, this would be rare and best practice to include this
    // before calling any function you do not want to send it null values unless your function is expecting that
    if (supervisorParticipant.key == null) {
      console.log('supervisorParticipant.key = null, returning');
      return;
    }
    // Barge-in will "unmute" their line if the are muted, else "mute" their line if they are unmuted
    // Also account for coach status to enable/disable barge as we call this when clicking the mute/unmute button
    if (muted) {
      ConferenceService.unmuteParticipant(conferenceSID, supervisorParticipant.key);
      if (coaching) {
        this.props.setBargeCoachStatus({ 
          muted: false, 
          barge: false
        });
      } else {
        this.props.setBargeCoachStatus({ 
          muted: false,
          barge: true
        });
      }
    } else {
      ConferenceService.muteParticipant(conferenceSID, supervisorParticipant.key);
      if (coaching) {
        this.props.setBargeCoachStatus({ 
          muted: true,
          barge: false 
        });
      } else {
        this.props.setBargeCoachStatus({ 
          muted: true,
          barge: true
        });
      }
    }
  }

  // On click we will be pulling the conference SID and supervisorSID
  // to trigger Mute / Unmute respectively for that user
  // We've built in resiliency if the supervisor refreshes their browser
  // or clicks monitor/un-monitor multiple times, it still confirms that
  // we allow the correct worker to coach on the call

  coachHandleClick = () => {
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSID = conference && conference.conferenceSid;
    const coaching = this.props.coaching;
    const conferenceChildren = conference?.source?.children || [];

    // Checking the conference within the task for a participant with the value "supervisor", 
    // is their status "joined", reason for this is every time you click monitor/unmonitor on a call
    // it creates an additional participant, the previous status will show as "left", we only want the active supervisor, 
    // and finally we want to ensure that the supervisor that is joined also matches their worker_sid 
    // which we pull from mapStateToProps at the bottom of this js file
    const supervisorParticipant = conferenceChildren.find(p => p.value.participant_type === 'supervisor' 
      && p.value.status === 'joined' 
      && this.props.myWorkerSID === p.value.worker_sid);
    console.log(`Current supervisorSID = ${supervisorParticipant.key}`);

    // Pulling the agentSID that we will be coaching on this conference
    // Ensuring they are a worker (IE agent) and it matches the agentWorkerSID we pulled from the props
    let agentParticipant = conferenceChildren.find(p => p.value.participant_type === 'worker'
    && this.props.agentWorkerSID === p.value.worker_sid);
    
    console.log(`Current agentWorkerSID = ${this.props.agentWorkerSID}`);
    console.log(`Current agentSID = ${agentParticipant?.key}`);

    // If the agentParticipant.key or supervisorParticipant.key is null return, this would be rare and best practice to include this
    // before calling any function you do not want to send it null values unless your function is expecting that
    if (agentParticipant.key == null || supervisorParticipant.key == null) {
      console.log('agentParticipant.key or supervisorParticipant.key = null, returning');
      return;
    }
    // Coaching will "enable" their line if they are disabled, else "disable" their line if they are enabled
    if (coaching) {
      ConferenceService.disableCoaching(conferenceSID, supervisorParticipant.key, agentParticipant.key);
      this.props.setBargeCoachStatus({ 
        coaching: false,
        muted: true,
        barge: false
      });

      // If coachingStatusPanel is true (enabled), proceed
      // otherwise we will not subscribe to the Sync Doc
      // You can toggle this at ../states/BargeCoachState
      const coachingStatusPanel = initialState.coachingStatusPanel;
      if (coachingStatusPanel) {
        // Updating the Sync Doc based on coaching status
        // Toggling Coaching to false, setting the SupervisorSID to "" as we use this
        // to validate if there is a supervisor actively coaching them within the Agent UI
        this.initSyncDoc(this.props.agentWorkerSID, conferenceSID, "", false);
      }
    } else {
      ConferenceService.enableCoaching(conferenceSID, supervisorParticipant.key, agentParticipant.key);
      this.props.setBargeCoachStatus({ 
        coaching: true,
        muted: false,
        barge: false 
      });

      // If coachingStatusPanel is true (enabled), proceed
      // otherwise we will not subscribe to the Sync Doc
      // You can toggle this at ../states/BargeCoachState
      const coachingStatusPanel = initialState.coachingStatusPanel;
      if (coachingStatusPanel) {
        // Updating the Sync Doc based on coaching status
        // Toggling Coaching to true, passing the supervisor's full name that is coaching
        // The Agent will pull this back within their Sync Doc to update the UI
        this.initSyncDoc(this.props.agentWorkerSID, conferenceSID, this.props.supervisorFN, true);
      }
    }
  }

  // Render the coach and barge-in buttons, disable if the call isn't live or
  // if the supervisor isn't monitoring the call, toggle the icon based on coach and barge-in status
  render() {
    const muted = this.props.muted;
    const barge = this.props.barge;
    const enableBargeinButton = this.props.enableBargeinButton;
    const coaching = this.props.coaching;
    const enableCoachButton = this.props.enableCoachButton;

    const isLiveCall = TaskHelper.isLiveCall(this.props.task);

    return (
      <ButtonContainer>
        <IconButton
          icon={ muted ? 'MuteLargeBold' : 'MuteLarge' }
          disabled={!isLiveCall || !enableBargeinButton || !enableCoachButton || (!barge && !coaching) }
          onClick={this.bargeHandleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={ muted ? "Unmute" : "Mute" }
          style={buttonStyle}
        />
        <IconButton
          icon={ barge ? `IncomingCallBold` :  'IncomingCall' }
          disabled={!isLiveCall || !enableBargeinButton || coaching }
          onClick={this.bargeHandleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={ barge ? 'Barge-Out' : 'Barge-In' }
          style={ barge ? buttonStyleActive : buttonStyle }
        />
        <IconButton
          icon={ coaching ? `DefaultAvatarBold` : `DefaultAvatar` }
          disabled={!isLiveCall || !enableCoachButton}
          onClick={this.coachHandleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={ coaching ? "Disable Coach Mode" : "Enable Coach Mode" }
          style={ coaching ? buttonStyleActive : buttonStyle }
        />
      </ButtonContainer>
    );
  }
}

// Getting the Supervisor's workerSID so we can use it later, the Agent's workerSID (stickyWorker) we are monitoring
// This is specific to coaching to ensure we are unmuting the correct worker, if there are multiple agents on the call
const mapStateToProps = (state) => {
  const myWorkerSID = state?.flex?.worker?.worker?.sid;
  const agentWorkerSID = state?.flex?.supervisor?.stickyWorker?.worker?.sid;
  const supervisorFN = state?.flex?.worker?.attributes?.full_name;
  console.log(`sticky worker = ${agentWorkerSID}`);

  // Also pulling back the states from the redux store as we will use those later
  // to manipulate the buttons
  const customReduxStore = state?.['barge-coach'].bargecoach;
  const muted = customReduxStore.muted;
  const barge = customReduxStore.barge;
  const enableBargeinButton = customReduxStore.enableBargeinButton;
  const coaching = customReduxStore.coaching;
  const enableCoachButton = customReduxStore.enableCoachButton;

  const teamViewPath = state?.flex?.router?.location?.pathname;

  // Storing teamViewPath and agentSyncDoc to browser cache to help if a refresh happens
  // will use this in the main plugin file to invoke an action to reset the monitor panel
  // and clear the Agent's Sync Doc
  if (teamViewPath != null) {
    console.log('Storing teamViewPath to cache');
    localStorage.setItem('teamViewPath',teamViewPath);

    // If coachingStatusPanel is true (enabled), proceed
    // otherwise we will not subscribe to the Sync Doc
    // You can toggle this at ../states/BargeCoachState
    const coachingStatusPanel = customReduxStore.coachingStatusPanel;
    if (coachingStatusPanel) {
    console.log('Storing agentSyncDoc to cache');
    localStorage.setItem('agentSyncDoc',`syncDoc.${agentWorkerSID}`);
    }
  }

  return {
    myWorkerSID,
    agentWorkerSID,
    supervisorFN,
    muted,
    barge,
    enableBargeinButton,
    coaching,
    enableCoachButton,
  };
};

// Mapping dispatch to props as I will leverage the setBargeCoachStatus
// to change the properties on the redux store, referenced above with this.props.setBargeCoachStatus
const mapDispatchToProps = (dispatch) => ({
  setBargeCoachStatus: bindActionCreators(BargeCoachStatusAction.setBargeCoachStatus, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(SupervisorBargeCoachButton));