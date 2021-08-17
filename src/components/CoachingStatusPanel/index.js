import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withTheme } from '@twilio/flex-ui';

import { Actions as BargeCoachStatusAction } from '../../states/BargeCoachState';
import CoachingStatusPanel from './CoachingStatusPanel.Component';

// Mapping the the logged in user sid so we can snag the Sync Doc
const mapStateToProps = (state) => {
  const myWorkerSid = state?.flex?.worker?.worker?.sid;

  /*
   * Also pulling back the states from the redux store as we will use those later
   * to manipulate the buttons
   */
  const { supervisorArray } = state?.['barge-coach'].bargecoach;

  return {
    myWorkerSid,
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

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(CoachingStatusPanel));
