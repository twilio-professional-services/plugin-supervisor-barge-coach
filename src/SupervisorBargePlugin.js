import { FlexPlugin } from 'flex-plugin';
import { Actions, VERSION } from '@twilio/flex-ui';
import React from 'react';

import { syncClient } from './services';
import SupervisorBargeCoachButton from './components/SupervisorBargeCoachButton';
import CoachingStatusPanel from './components/CoachingStatusPanel';
import SupervisorPrivateToggle from './components/SupervisorPrivateModeButton';
import SupervisorMonitorPanel from './components/SupervisorMonitorPanel';
import reducers, { namespace } from './states';
import { Actions as BargeCoachStatusAction } from './states/BargeCoachState';
import './listeners/CustomListeners';

const PLUGIN_NAME = 'SupervisorBargeCoachPlugin';

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
  init = async (flex, manager) => {
    // Registering the custom reducer/redux store
    this.registerReducers(manager);
    // Add the Barge-in and Coach Option
    flex.Supervisor.TaskOverviewCanvas.Content.add(<SupervisorBargeCoachButton key="bargecoach-buttons" />);
    // Add the Supervisor Private Mode Toggle
    flex.Supervisor.TaskOverviewCanvas.Content.add(<SupervisorPrivateToggle key="supervisorprviate-button" />);
    // Add the Supervisor Monitor Panel
    flex.Supervisor.TaskCanvasTabs.Content.add(
      <SupervisorMonitorPanel title="Supervisors Engaged" icon="Supervisor" key="supervisoronitorpanel" />,
    );

    // Adding Coaching Status Panel to notify the agent who is Coaching them
    flex.CallCanvas.Content.add(<CoachingStatusPanel key="coaching-status-panel"> </CoachingStatusPanel>, {
      sortOrder: -1,
    });

    /*
     * Only used for the coach feature if some reason the browser refreshes after the agent is being monitored
     * we will lose the stickyWorker attribute that we use for workerSid (see \components\SupervisorBargeCoachButton.js for reference)
     * We need to invoke an action to trigger this again, so it populates the stickyWorker for us
     */
    const workerSid = manager.store.getState().flex?.supervisor?.stickyWorker?.worker?.sid;
    const teamViewPath = localStorage.getItem('teamViewPath');

    // Check that the stickyWorker is null and that we are attempting to restore the last worker they monitored
    if (workerSid === null && teamViewPath !== null) {
      /*
       * We are parsing the prop teamViewTaskPath into an array, split it between the '/',
       * then finding which object in the array starts with WR, which is the SID we need
       */
      const arrayTeamView = teamViewPath.split('/');
      const teamViewTaskSID = arrayTeamView.filter((s) => s.includes('WR'));

      // Invoke action to trigger the monitor button so we can populate the stickyWorker attribute
      await Actions.invokeAction('SelectTaskInSupervisor', { sid: teamViewTaskSID });

      // If agentSyncDoc exists, clear the Agent Sync Doc to account for the refresh
      const agentSyncDoc = localStorage.getItem('agentSyncDoc');
      if (agentSyncDoc !== null) {
        await syncClient.clearSyncDoc(agentSyncDoc);
      }
      /*
       * This is here if the Supervisor refreshes and has toggled alerts to false
       * By default alerts are enabled unless they toggle it off
       */
      const privateToggle = localStorage.getItem('privateToggle');
      if (privateToggle === 'false') {
        manager.store.dispatch(
          BargeCoachStatusAction.setBargeCoachStatus({
            coachingStatusPanel: false,
          }),
        );
      }
    }
  };

  /**
   * Registers the plugin reducers
   *
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
