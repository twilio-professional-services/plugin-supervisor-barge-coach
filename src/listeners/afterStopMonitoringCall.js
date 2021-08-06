import { Actions } from '@twilio/flex-ui';

import { logger } from '../utils';
import { Actions as BargeCoachStatusAction } from '../states/BargeCoachState';
import { syncClient } from '../services';

/**
 * Listening for supervisor to click to unmonitor the call to disable the barge and coach buttons,
 * as well as reset their muted/coaching states
 *
 * @param manager { import('@twilio/flex-ui').Manager }
 */
export default function afterStopMonitoringCall(manager) {
  Actions.addListener('afterStopMonitoringCall', async () => {
    logger.log(`Unmonitor button triggered, disable the Coach and Barge-In Buttons`);
    manager.store.dispatch(
      BargeCoachStatusAction.setBargeCoachStatus({
        enableCoachButton: false,
        coaching: false,
        barge: false,
        enableBargeinButton: false,
        muted: true,
      }),
    );

    // Capture some info so we can remove the supervisor from the Sync Doc
    const agentSid = manager.store.getState().flex?.supervisor?.stickyWorker?.worker?.sid;
    const supervisorFullName = manager.store.getState().flex?.worker?.attributes?.full_name;

    /*
     * Sending the agentSid so we know which Sync Doc to update, the Supervisor's Full Name, and the remove status
     * We don't care about the second or forth section in here as we are removing the Supervisor in this case
     * Typically we would pass in the conferenceSid and what the supervisor is doing (see SupervisorBargeCoachButton.Component.js if you wish to see that in use)
     */
    await syncClient.initSyncDoc(agentSid, '', supervisorFullName, '', 'remove');
  });
}
