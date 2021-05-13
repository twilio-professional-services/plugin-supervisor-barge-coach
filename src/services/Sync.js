import { SYNC_CLIENT } from "../SupervisorBargePlugin";

class SyncDocClass {

	constructor() {
	}

	// Getting the Sync Document
	getSyncDoc(syncDocName) {
		return new Promise(function (resolve) {
			SYNC_CLIENT
				.document(syncDocName)
				.then(doc => {
					resolve(doc)
				})
		})
	}

	// This is where we update the Sync Document we pass in the syncDocName we are updating, the conferenceSID
	// we are monitoring/coaching, the supervisor's Full name, and toggle the coaching status true/false
	updateSyncDoc(syncDocName, conferenceSID, supervisorFN, coaching) {
		SYNC_CLIENT
			.document(syncDocName)
			.then(doc => {
				doc.update({
					data: { 
						'conference': conferenceSID,
						'supervisor': supervisorFN,
						'coachingstatus': coaching
					}
				});
				return new Promise(function (resolve) {
					SYNC_CLIENT
						.document(syncDocName)
						.then(doc => {
							resolve(doc)
						})
				})
			})
	}

	// This will be called when we are tearing down the call to clean up the Sync Doc
	clearSyncDoc(syncDocName) {
		SYNC_CLIENT
			.document(syncDocName)
			.then(doc => {
				doc.update({
					data: { 
						'conference': "",
						'supervisor': "",
						'coachingstatus': false
					}
				});
			})
	}
}

export const SyncDoc = new SyncDocClass();
