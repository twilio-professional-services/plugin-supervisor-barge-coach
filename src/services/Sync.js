import { SYNC_CLIENT } from '../SupervisorBargePlugin';

class SyncDocClass {
  // Getting the Sync Document
  getSyncDoc = async (syncDocName) => {
    return SYNC_CLIENT.document(syncDocName);
  };

  /*
   * This function takes inputs from other parts of the application to add/remove based on the updateStatus
   * we will adjust the array and eventually pass this into the updateSyncDoc function to update the Sync Doc with the new array
   */
  initSyncDoc = async (agentWorkerSID, conferenceSID, supervisorFN, supervisorStatus, updateStatus) => {
    const docToUpdate = `syncDoc.${agentWorkerSID}`;

    /*
     * Getting the latest Sync Doc agent list and storing in an array
     * We will use this to add/remove the appropriate supervisor and then update the Sync Doc
     */
    const supervisorsArray = [];

    const doc = await this.getSyncDoc(docToUpdate);
    // Confirm the Sync Doc supervisors array isn't null, as of ES6 we can use the spread syntax to clone the array
    if (doc.value.data.supervisors !== null) {
      supervisorsArray.push(...doc.value.data.supervisors);
    }

    /*
     * Checking Updated Status we pass during the button click
     * to push/add the supervisor from the Supervisor Array within the Sync Doc
     * adding their Full Name and Conference - the Agent will leverage these values
     */
    if (updateStatus === 'add') {
      console.log(
        `Updating Sync Doc: ${docToUpdate} supervisor: ${supervisorFN} has been ADDED to the supervisor array`,
      );
      supervisorsArray.push({
        conference: conferenceSID,
        supervisor: supervisorFN,
        status: supervisorStatus,
      });
      // Update the Sync Doc with the new supervisorsArray
      await this.updateSyncDoc(docToUpdate, supervisorsArray);

      /*
       * Checking Updated Status we pass during the button click
       * to splice/remove the Supervisor from the Supervisor Array within the Sync Doc
       */
    } else if (updateStatus === 'remove') {
      console.log(
        `Updating Sync Doc: ${docToUpdate}, supervisor: ${supervisorFN} has been REMOVED from the supervisor array`,
      );
      // Get the index of the Supervisor we need to remove in the array
      const removeSupervisorIndex = supervisorsArray.findIndex((s) => s.supervisor === supervisorFN);
      // Ensure we get something back, let's splice this index where the Supervisor is within the array
      if (removeSupervisorIndex > -1) {
        supervisorsArray.splice(removeSupervisorIndex, 1);
      }
      // Update the Sync Doc with the new supervisorsArray
      await this.updateSyncDoc(docToUpdate, supervisorsArray);
    }
  };

  /*
   * This is where we update the Sync Document we pass in the syncDocName we are updating, the conferenceSID
   * we are monitoring/coaching, the supervisor's Full name, and toggle the coaching status true/false
   * to the supervisor array
   */
  updateSyncDoc = async (syncDocName, supervisorsObject) => {
    const doc = await this.getSyncDoc(syncDocName);
    await doc.update({
      data: { supervisors: supervisorsObject },
    });
    return this.getSyncDoc(syncDocName);
  };

  // This will be called when we are tearing down the call to clean up the Sync Doc
  clearSyncDoc = async (syncDocName) => {
    const doc = await this.getSyncDoc(syncDocName);
    await doc.update({
      data: { supervisors: [] },
    });
  };

  // Called when we wish to close/unsubscribe from a specific sync document
  closeSyncDoc = async (syncDocName) => {
    const doc = await this.getSyncDoc(syncDocName);
    await doc.close();
  };
}

export default new SyncDocClass();
