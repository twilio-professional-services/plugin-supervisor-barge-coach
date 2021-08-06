// Mapping the agent's sid and supervisor full name
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withTheme } from '@twilio/flex-ui';

import { Actions as BargeCoachStatusAction } from '../../../states/BargeCoachState';
import SupervisorMonitorPanel from './SupervisorMonitorPanel.Component';

const mapStateToProps = (state) => {
  const agentWorkerSid = state?.flex?.supervisor?.stickyWorker?.worker?.sid;
  const supervisorFullName = state?.flex?.worker?.attributes?.full_name;

  /*
   * Also pulling back the states from the redux store as we will use those later
   * to manipulate the buttons
   */
  const customReduxStore = state?.['barge-coach'].bargecoach;
  const { supervisorArray } = customReduxStore;

  return {
    agentWorkerSid,
    supervisorFullName,
    supervisorArray,
  };
};

/*
 * Mapping dispatch to props as I will leverage the setBargeCoachStatus
 * to change the properties on the redux store, referenced above with this.props.setBargeCoachStatus
 */
const mapDispatchToProps = (dispatch) => ({
  setBargeCoachStatus: bindActionCreators(BargeCoachStatusAction.setBargeCoachStatus, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(SupervisorMonitorPanel));
