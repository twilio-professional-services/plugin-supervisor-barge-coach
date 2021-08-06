import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withTheme } from '@twilio/flex-ui';

import { logger } from '../../utils';
import { localCacheClient } from '../../services';
import { Actions as BargeCoachStatusAction } from '../../states/BargeCoachState';
import SupervisorBargeCoachButton from './SupervisorBargeCoachButton.Component';

/*
 * Getting the Supervisor's workerSid so we can use it later, the Agent's workerSid (stickyWorker) we are monitoring
 * This is specific to coaching to ensure we are unmuting the correct worker, if there are multiple agents on the call
 */
const mapStateToProps = (state) => {
  const myWorkerSid = state?.flex?.worker?.worker?.sid;
  const agentWorkerSid = state?.flex?.supervisor?.stickyWorker?.worker?.sid;
  const supervisorFullName = state?.flex?.worker?.attributes?.full_name;

  /*
   * Also pulling back the states from the redux store as we will use those later
   * to manipulate the buttons
   */
  const customReduxStore = state?.['barge-coach'].bargecoach;
  const {
    muted,
    barge,
    enableBargeinButton,
    coaching,
    enableCoachButton,
    coachingStatusPanel,
    coachingLoading,
    bargingLoading,
    mutingLoading,
  } = customReduxStore;

  const teamViewPath = state?.flex?.router?.location?.pathname;

  /*
   * Storing teamViewPath and agentSyncDoc to browser cache to help if a refresh happens
   * will use this in the main plugin file to invoke an action to reset the monitor panel
   * and clear the Agent's Sync Doc
   */
  if (teamViewPath !== null) {
    localCacheClient.setTeamViewPath(teamViewPath);
    localCacheClient.setAgentSyncDoc(`syncDoc.${agentWorkerSid}`);
  }

  return {
    myWorkerSid,
    agentWorkerSid,
    supervisorFullName,
    muted,
    mutingLoading,
    barge,
    enableBargeinButton,
    bargingLoading,
    coaching,
    enableCoachButton,
    coachingStatusPanel,
    coachingLoading,
    disableAllButtons: coachingLoading || bargingLoading || mutingLoading,
  };
};

/*
 * Mapping dispatch to props as I will leverage the setBargeCoachStatus
 * to change the properties on the redux store, referenced above with this.props.setBargeCoachStatus
 */
const mapDispatchToProps = (dispatch) => ({
  setBargeCoachStatus: bindActionCreators(BargeCoachStatusAction.setBargeCoachStatus, dispatch),
  resetBargeCoachStatus: bindActionCreators(BargeCoachStatusAction.resetBargeCoachStatus, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(SupervisorBargeCoachButton));
