import { FlexPlugin } from 'flex-plugin';
import { Actions, VERSION } from '@twilio/flex-ui';
import React from 'react';

import { localCacheClient, syncClient } from './services';
import { SupervisorPrivateModeButton, SupervisorBargeCoachButton, CoachingStatusPanel } from './components';
import reducers, { namespace } from './states';
import { Actions as BargeCoachStatusAction, initialState } from './states/BargeCoachState';
import { logger, notifications } from './utils';
import * as listeners from './listeners';

export default class SupervisorBargeCoachPlugin extends FlexPlugin {
  static PLUGIN_NAME = 'SupervisorBargeCoachPlugin';

  constructor() {
    super(SupervisorBargeCoachPlugin.PLUGIN_NAME);

    logger._setPrefix(SupervisorBargeCoachPlugin.PLUGIN_NAME);
    notifications._registerNotifications(SupervisorBargeCoachPlugin.PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init = async (flex, manager) => {
    // Registering action listeners
    this.registerListeners(manager);
    // Registering the custom reducer/redux store
    this.registerReducers(manager);
    // Add the components
    this.addComponents(flex);
    // Hydrates initial state
    await this.hydrateInitialState(manager);
  };

  /**
   * Registers the plugin reducers
   *
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint-disable-next-line no-console
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }

  /**
   * Registers the listeners
   *
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  registerListeners(manager) {
    listeners.afterMonitorCallListener(manager);
    listeners.afterStopMonitoringCallListener(manager);

    /*
     * If coachingStatusPanel is true (enabled), proceed otherwise we will not subscribe to the Sync Doc.
     * You can toggle this at ../states/BargeCoachState
     */
    if (initialState.coachingStatusPanel) {
      listeners.reservationCreatedListener(manager);
    }
  }

  /**
   * Adds all the components
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   */
  addComponents(flex) {
    // Add the Barge-in and Coach Option
    flex.Supervisor.TaskOverviewCanvas.Content.add(<SupervisorBargeCoachButton key="barge-coach-buttons" />);
    // Add the Supervisor Private Mode Toggle
    flex.Supervisor.TaskOverviewCanvas.Content.add(<SupervisorPrivateModeButton key="supervisor-private-button" />);
    // Adding Coaching Status Panel to notify the agent who is Coaching them
    flex.CallCanvas.Content.add(<CoachingStatusPanel key="coaching-status-panel"> </CoachingStatusPanel>, {
      sortOrder: -1,
    });
  }

  /**
   * Rehydrates states from localStorage
   *
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async hydrateInitialState(manager) {
    logger.log('Hydrating initial states');

    /*
     * Only used for the coach feature if some reason the browser refreshes after the agent is being monitored
     * we will lose the stickyWorker attribute that we use for workerSid (see \components\SupervisorBargeCoachButton.Component.js for reference)
     * We need to invoke an action to trigger this again, so it populates the stickyWorker for us
     */
    const workerSid = manager.store.getState().flex?.supervisor?.stickyWorker?.worker?.sid;
    const teamViewPath = localCacheClient.getTeamViewPath();

    // Check that the stickyWorker is null and that we are attempting to restore the last worker they monitored
    if (!workerSid && teamViewPath !== null) {
      /*
       * We are parsing the prop teamViewTaskPath into an array, split it between the '/',
       * then finding which object in the array starts with WR, which is the Sid we need
       */
      const taskSid = teamViewPath.split('/').filter((s) => s.includes('WR'));

      // Invoke action to trigger the monitor button so we can populate the stickyWorker attribute
      await Actions.invokeAction('SelectTaskInSupervisor', { sid: taskSid });

      // If agentSyncDoc exists, clear the Agent Sync Doc to account for the refresh
      const agentSyncDoc = localCacheClient.getAgentSyncDoc();
      if (agentSyncDoc !== null) {
        await syncClient.clearSyncDoc(agentSyncDoc);
      }
      /*
       * This is here if the Supervisor refreshes and has toggled alerts to false
       * By default alerts are enabled unless they toggle it off
       */
      const privateToggle = localCacheClient.getPrivateToggle();
      if (privateToggle === 'false') {
        manager.store.dispatch(BargeCoachStatusAction.setBargeCoachStatus({ coachingStatusPanel: false }));
      }
    }
  }
}
