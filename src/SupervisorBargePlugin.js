import { FlexPlugin } from 'flex-plugin';
import { Manager, Actions, VERSION } from '@twilio/flex-ui';
import React from 'react';

// Leverage for the Sync Documents used for Coach Alerts across user sessions
import { SyncClient } from "twilio-sync";
// Used for Sync Docs
import { SyncDoc } from './services/Sync'

// import for the supervisor barge and coach buttons component, and Coaching Panel
import SupervisorBargeCoachButton from './components/SupervisorBargeCoachButton'; 
import CoachingStatusPanel from './components/CoachingStatusPanel';

// import the reducers
import reducers, { namespace } from './states';
// import the custom listeners
import './listeners/CustomListeners';

const PLUGIN_NAME = 'SupervisorBargeCoachPlugin';

// Generate token for the sync client
export const SYNC_CLIENT = new SyncClient(Manager.getInstance().user.token);

// Refresh sync client token
function tokenUpdateHandler() {

  console.log("OUTBOUND DIALPAD: Refreshing SYNC_CLIENT Token");

  const loginHandler = Manager.getInstance().store.getState().flex.session.loginHandler;

  const tokenInfo = loginHandler.getTokenInfo();
  const accessToken = tokenInfo.token;

  SYNC_CLIENT.updateToken(accessToken);
}

export default class SupervisorBargeCoachPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    //Registering the custom reducer/redux store
    this.registerReducers(manager);
    //Add the Barge-in and Coach Option
    flex.Supervisor.TaskOverviewCanvas.Content.add(<SupervisorBargeCoachButton key="bargecoach-buttons" />);
    
    // Adding Coaching Status Panel to notify the agent who is Coaching them
    flex.CallCanvas.Content.add(
      <CoachingStatusPanel key="coaching-status-panel"> </CoachingStatusPanel>, {
        sortOrder: -1
    });
    
    // Only used for the coach feature if some reason the browser refreshes after the agent is being monitored
    // we will lose the stickyWorker attribute that we use for agentWorkerSID (see \components\SupervisorBargeCoachButton.js for reference)
    // We need to invoke an action to trigger this again, so it populates the stickyWorker for us 
    const agentWorkerSID = manager.store.getState().flex?.supervisor?.stickyWorker?.worker?.sid;
    const teamViewPath = localStorage.getItem('teamViewPath');

    // Check that the stickyWorker is null and that we are attempting to restore the last worker they monitored
    if (agentWorkerSID == null && teamViewPath != null) {
      console.log(`${teamViewPath}`);

      // We are parsing the prop teamViewTaskPath into an array, split it between the '/',
      // then finding which object in the array starts with WR, which is the SID we need
      const arrayTeamView = teamViewPath.split('/');
      const teamViewTaskSID = arrayTeamView.filter(s => s.includes('WR'));
      console.log(`teamViewSID = ${teamViewTaskSID}`);

      // Invoke action to trigger the monitor button so we can populate the stickyWorker attribute
      console.log(`Triggering the invokeAction`);
      Actions.invokeAction("SelectTaskInSupervisor", { sid: teamViewTaskSID });

      // If agentSyncDoc exists, clear the Agent Sync Doc to account for the refresh
      const agentSyncDoc = localStorage.getItem('agentSyncDoc');
      if(agentSyncDoc != null) {
        SyncDoc.clearSyncDoc(agentSyncDoc);
      }
    }

    // Add listener to loginHandler to refresh token when it expires
    manager.store.getState().flex.session.loginHandler.on("tokenUpdated", tokenUpdateHandler);
  
  } //end init

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
     registerReducers(manager) {
      if (!manager.store.addReducer) {
        // eslint: disable-next-line
        console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
        return;
      }
  
      manager.store.addReducer(namespace, reducers);
    }
} //end SupervisorBargeCoachPlugin
