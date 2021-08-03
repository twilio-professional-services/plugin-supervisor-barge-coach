import * as React from 'react';
import { IconButton, TaskHelper, withTheme } from '@twilio/flex-ui';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { syncClient } from '../services';
import { Actions as BargeCoachStatusAction } from '../states/BargeCoachState';

const ButtonContainer = styled('div')`
  display: flex;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
  text-align: center;
  justify-content: center;
`;

const buttonStyleActive = {
  marginLeft: '6px',
  marginRight: '6px',
  color: 'forestgreen',
};

const buttonStyle = {
  marginLeft: '6px',
  marginRight: '6px',
};

class SupervisorPrivateToggle extends React.Component {
  /*
   * We will toggle the private mode on/off based on the button click and the state
   * of the coachingStatusPanel along with updating the Sync Doc appropriately
   */
  togglePrivateMode = async () => {
    const { coachingStatusPanel } = this.props;
    const { coaching } = this.props;
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSID = conference && conference.conferenceSid;

    if (coachingStatusPanel) {
      this.props.setBargeCoachStatus({
        coachingStatusPanel: false,
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
      this.props.setBargeCoachStatus({
        coachingStatusPanel: true,
      });
      /*
       * Updating the Sync Doc based on coaching status only if coaching is true
       * The Agent will pull this back within their Sync Doc to update the UI
       */
      if (coaching) {
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
   * Render the Supervisor Private Mode Button to toggle if the supervisor wishes to remain private when
   * coaching the agent
   */
  render() {
    const { coachingStatusPanel } = this.props;

    const isLiveCall = TaskHelper.isLiveCall(this.props.task);

    return (
      <ButtonContainer>
        <IconButton
          icon={coachingStatusPanel ? 'EyeBold' : 'Eye'}
          disabled={!isLiveCall}
          onClick={this.togglePrivateMode}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={coachingStatusPanel ? 'Enable Private Mode' : 'Disable Private Mode'}
          style={coachingStatusPanel ? buttonStyleActive : buttonStyle}
        />
        {coachingStatusPanel ? 'Normal Mode' : 'Private Mode'}
      </ButtonContainer>
    );
  }
}

// Mapping the agent's sid, supervisor full name, and coachingStatusPanel flag within the custom redux store/state
const mapStateToProps = (state) => {
  const agentWorkerSID = state?.flex?.supervisor?.stickyWorker?.worker?.sid;
  const supervisorFN = state?.flex?.worker?.attributes?.full_name;

  const customReduxStore = state?.['barge-coach'].bargecoach;
  const { coaching } = customReduxStore;
  const { coachingStatusPanel } = customReduxStore;

  /*
   * Storing the coachingStatusPanel value that will be used in SupervisorBargePlugin.js
   * If the supervisor refreshes, we want to remember their preference
   */
  console.log('Storing privateToggle to cache');
  localStorage.setItem('privateToggle', coachingStatusPanel);

  return {
    agentWorkerSID,
    supervisorFN,
    coaching,
    coachingStatusPanel,
  };
};

/*
 * Mapping dispatch to props as I will leverage the setBargeCoachStatus
 * to change the properties on the redux store, referenced above with this.props.setBargeCoachStatus
 */
const mapDispatchToProps = (dispatch) => ({
  setBargeCoachStatus: bindActionCreators(BargeCoachStatusAction.setBargeCoachStatus, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(SupervisorPrivateToggle));
