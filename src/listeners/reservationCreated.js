import { Actions } from '@twilio/flex-ui';

import { logger } from '../utils';
import { Actions as BargeCoachStatusAction } from '../states/BargeCoachState';
import { syncClient } from '../services';

/**
 * Listening for agent to hang up the call so we can clear the Sync Doc for the CoachStatePanel feature
 *
 * @param manager { import('@twilio/flex-ui').Manager }
 */
export default function reservationCreated(manager) {
  manager.workerClient.on('reservationCreated', (reservation) => {
    // Register listener for reservation wrap up event
    reservation.on('wrapup', async () => {
      logger.log(`Hangup button triggered, clear the Sync Doc`);
      manager.store.dispatch(BargeCoachStatusAction.resetBargeCoachStatus());

      const workerSid = manager.store.getState().flex?.worker?.worker?.sid;
      const agentSyncDoc = `syncDoc.${workerSid}`;

      // Let's clear the Sync Document and also close/end our subscription to the Document
      await syncClient.clearSyncDoc(agentSyncDoc);
      await syncClient.closeSyncDoc(agentSyncDoc);
    });
  });
}
