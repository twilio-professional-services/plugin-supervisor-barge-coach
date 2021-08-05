import { Manager } from '@twilio/flex-ui';
import { SyncClient as TwilioSyncClient } from 'twilio-sync';

import { logger } from '../utils';

class SyncClient {
  #client;

  constructor(manager) {
    this.#client = new TwilioSyncClient(manager.user.token);

    manager.store.getState().flex.session.loginHandler.on('tokenUpdated', () => {
      logger.log('Refreshing SyncClient Token');
      this.#client.updateToken(manager.store.getState().flex.session.getTokenInfo().token);
    });
  }

  /**
   * Returns the Sync Document instance
   * @param docName the Sync Document to return
   */
  getSyncDoc = async (docName) => {
    return this.#client.document(docName);
  };

  /**
   * This function takes inputs from other parts of the application to add/remove based on the updateStatus.
   * We will adjust the array and eventually pass this into the updateSyncDoc function to update the Sync Doc with the new array
   * @param workerSid
   * @param conferenceSid
   * @param supervisorFullName
   * @param supervisorStatus
   * @param updateStatus
   * @return {Promise<void>}
   */
  initSyncDoc = async (workerSid, conferenceSid, supervisorFullName, supervisorStatus, updateStatus) => {
    const docName = `syncDoc.${workerSid}`;
    const doc = await this.getSyncDoc(docName);
    logger.log(
      `Updating (${updateStatus}) doc ${docName} with supervisors ${supervisorFullName} (${supervisorStatus}) on conference ${conferenceSid}`,
    );
    /*
     * Getting the latest Sync Doc agent list and storing in an array
     * We will use this to add/remove the appropriate supervisor and then update the Sync Doc
     */
    const supervisorList = [];

    // Confirm the Sync Doc supervisors array isn't null, as of ES6 we can use the spread syntax to clone the array
    if (doc.value.data.supervisors !== null) {
      supervisorList.concat(...doc.value.data.supervisors);
    }

    /*
     * Checking Updated Status we pass during the button click
     * to push/add the supervisor from the Supervisor Array within the Sync Doc
     * adding their Full Name and Conference - the Agent will leverage these values
     */
    if (updateStatus === 'add') {
      supervisorList.push({
        conference: conferenceSid,
        supervisor: supervisorFullName,
        status: supervisorStatus,
      });
      // Update the Sync Doc with the new supervisorList
      await this.updateSyncDoc(docName, supervisorList);
      return;
    }

    /*
     * Checking Updated Status we pass during the button click
     * to splice/remove the Supervisor from the Supervisor Array within the Sync Doc
     */
    if (updateStatus === 'remove') {
      // Get the index of the Supervisor we need to remove in the array
      const removeSupervisorIndex = supervisorList.findIndex((s) => s.supervisor === supervisorFullName);
      // Ensure we get something back, let's splice this index where the Supervisor is within the array
      if (removeSupervisorIndex > -1) {
        supervisorList.splice(removeSupervisorIndex, 1);
      }
      // Update the Sync Doc with the new supervisorList
      await this.updateSyncDoc(docName, supervisorList);
    }
  };

  /**
   * This is where we update the Sync Document we pass in the syncDocName we are updating, the conferenceSid
   * we are monitoring/coaching, the supervisor's Full name, and toggle the coaching status true/false
   * to the supervisor array
   * @param docName the doc name to update
   * @param supervisors the list of supervisors to update
   */
  updateSyncDoc = async (docName, supervisors) => {
    const doc = await this.getSyncDoc(docName);
    await doc.update({
      data: { supervisors },
    });

    return this.getSyncDoc(docName);
  };

  /**
   * This will be called when we are tearing down the call to clean up the Sync Doc
   * @param docName the doc name to update
   */
  clearSyncDoc = async (docName) => {
    await this.updateSyncDoc(docName, []);
  };

  /**
   * Called when we wish to close/unsubscribe from a specific sync document
   * @param docName the doc name to close
   */
  closeSyncDoc = async (docName) => {
    const doc = await this.getSyncDoc(docName);
    await doc.close();
  };
}

const syncClient = new SyncClient(Manager.getInstance());

export default syncClient;
