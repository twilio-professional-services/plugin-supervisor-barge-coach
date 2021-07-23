import * as React from 'react';
import { withTheme } from '@twilio/flex-ui';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { syncService } from '../services';
import { Actions as BargeCoachStatusAction } from '../states/BargeCoachState';

const Status = styled('div')`
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: left;
  text-align: left;
`;

class SupervisorMonitorPanel extends React.Component {
  supervisorArray() {
    return this.props.supervisorArray.map((supervisorArray) => (
      <tr key={supervisorArray.supervisor}>
        <td>{supervisorArray.supervisor}</td>
        <td style={{ color: 'green' }}>&nbsp;{supervisorArray.status}</td>
      </tr>
    ));
  }

  render() {
    /*
     * If the supervisor array has value in it, that means someone is coaching
     * We will map each of the supervisors that may be actively coaching
     * Otherwise we will not display anything if no one is actively coaching
     */
    const { agentWorkerSID } = this.props;
    let { supervisorArray } = this.props;
    /*
     * Let's subscribe to the sync doc as an agent/work and check
     * if we are being coached, if we are, render that in the UI
     * otherwise leave it blank
     */
    // TODO: FIX THIS ASAP
    const mySyncDoc = `syncDoc.${agentWorkerSID}`;
    syncService.getSyncDoc(mySyncDoc).then((doc) => {
      // We are subscribing to Sync Doc updates here and logging anytime that happens
      doc.on('updated', (updatedDoc) => {
        if (doc.value.data.supervisors === null) {
          supervisorArray = [];
        } else {
          supervisorArray = [...doc.value.data.supervisors];
        }

        // Set Supervisor's name that is coaching into props
        this.props.setBargeCoachStatus({
          supervisorArray,
        });
      });
    });

    if (this.props.supervisorArray.length === 0) {
      return (
        <Status>
          <div>
            <h1 id="title" fontWeight="bold">
              Active Supervisors:
            </h1>
            <table id="supervisors">
              <tbody>{this.supervisorArray()}</tbody>
            </table>
          </div>
        </Status>
      );
    }
    return (
      <Status>
        <div>
          <h1 id="title" fontWeight="bold">
            Active Supervisors:
          </h1>
          None
        </div>
      </Status>
    );
  }
}

// Mapping the agent's sid and supervisor full name
const mapStateToProps = (state) => {
  const agentWorkerSID = state?.flex?.supervisor?.stickyWorker?.worker?.sid;
  const supervisorFN = state?.flex?.worker?.attributes?.full_name;

  /*
   * Also pulling back the states from the redux store as we will use those later
   * to manipulate the buttons
   */
  const customReduxStore = state?.['barge-coach'].bargecoach;
  const { supervisorArray } = customReduxStore;

  return {
    agentWorkerSID,
    supervisorFN,
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
