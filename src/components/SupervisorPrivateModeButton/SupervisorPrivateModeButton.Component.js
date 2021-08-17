import * as React from 'react';
import { IconButton, TaskHelper } from '@twilio/flex-ui';

import { syncClient } from '../../services';
import { ButtonContainer, buttonStyle, buttonStyleActive } from './SupervisorPrivateModeButton.Style';

export default class SupervisorPrivateModeButtonComponent extends React.Component {
  /*
   * We will toggle the private mode on/off based on the button click and the state
   * of the coachingStatusPanel along with updating the Sync Doc appropriately
   */
  togglePrivateMode = async () => {
    const { coachingStatusPanel, coaching, agentWorkerSid, supervisorFullName } = this.props;
    const conferenceSid = this.props.task?.conference?.conferenceSid;

    if (coachingStatusPanel) {
      this.props.setBargeCoachStatus({
        coachingStatusPanel: false,
      });
      // Updating the Sync Doc to reflect that we are no longer coaching and back into Monitoring
      await syncClient.initSyncDoc(agentWorkerSid, conferenceSid, supervisorFullName, 'is Monitoring', 'remove');
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
        await syncClient.initSyncDoc(agentWorkerSid, conferenceSid, supervisorFullName, 'is Coaching', 'add');
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
