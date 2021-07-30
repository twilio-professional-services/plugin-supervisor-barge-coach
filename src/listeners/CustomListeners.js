import { Actions, Manager } from '@twilio/flex-ui';

import { Actions as BargeCoachStatusAction, initialState } from '../states/BargeCoachState';
import { syncClient } from '../services';

const manager = Manager.getInstance();

/*
 * Listening for supervisor to monitor the call to enable the
 * barge and coach buttons, as well as reset their muted/coaching states
 */
Actions.addListener('afterMonitorCall', () => {
  console.log(`Monitor button triggered, enable the Coach and Barge-In Buttons`);
  manager.store.dispatch(
    BargeCoachStatusAction.setBargeCoachStatus({
      enableCoachButton: true,
      coaching: false,
      enableBargeinButton: true,
      muted: true,
    }),
  );
});

/*
 * Listening for supervisor to click to unmonitor the call to disable the
 * barge and coach buttons, as well as reset their muted/coaching states
 */
Actions.addListener('afterStopMonitoringCall', async () => {
  console.log(`Unmonitor button triggered, disable the Coach and Barge-In Buttons`);
  manager.store.dispatch(
    BargeCoachStatusAction.setBargeCoachStatus({
      enableCoachButton: false,
      coaching: false,
      enableBargeinButton: false,
      muted: true,
    }),
  );

  // Capture some info so we can remove the supervisor from the Sync Doc
  const agentSid = manager.store.getState().flex?.supervisor?.stickyWorker?.worker?.sid;
  const supervisorFN = manager.store.getState().flex?.worker?.attributes?.full_name;

  /*
   * Sending the agentSid so we know which Sync Doc to update, the Supervisor's Full Name, and the remove status
   * We don't care about the second or forth section in here as we are removing the Supervisor in this case
   * Typically we would pass in the conferenceSID and what the supervisor is doing (see SupervisorBargeCoachButton.js if you wish to see that in use)
   */
  await syncClient.initSyncDoc(agentSid, '', supervisorFN, '', 'remove');
});

/*
 * If coachingStatusPanel is true (enabled), proceed otherwise we will not subscribe to the Sync Doc.
 * You can toggle this at ../states/BargeCoachState
 */
if (initialState.coachingStatusPanel) {
  /*
   * Listening for agent to hang up the call so we can clear the Sync Doc
   * for the CoachStatePanel feature
   */
  manager.workerClient.on('reservationCreated', (reservation) => {
    // Register listener for reservation wrap up event
    reservation.on('wrapup', async () => {
      console.log(`Hangup button triggered, clear the Sync Doc`);
      manager.store.dispatch(
        BargeCoachStatusAction.setBargeCoachStatus({
          enableCoachButton: false,
          coaching: false,
          enableBargeinButton: false,
          muted: true,
        }),
      );

      const workerSid = manager.store.getState().flex?.worker?.worker?.sid;
      const agentSyncDoc = `syncDoc.${workerSid}`;

      // Let's clear the Sync Document and also close/end our subscription to the Document
      await syncClient.clearSyncDoc(agentSyncDoc);
      await syncClient.closeSyncDoc(agentSyncDoc);
    });
  });
}
