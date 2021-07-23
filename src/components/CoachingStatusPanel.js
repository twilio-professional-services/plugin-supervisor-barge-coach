import React from 'react';
import { withTheme } from '@twilio/flex-ui';
import styled from '@emotion/styled';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Actions as BargeCoachStatusAction } from '../states/BargeCoachState';
import { SyncDoc } from '../services/Sync';

const Status = styled('div')`
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
  text-align: center;
`;

class CoachingStatusPanel extends React.Component {
  render() {
    const { myWorkerSID } = this.props;
    let { supervisorArray } = this.props;
    /*
     * Let's subscribe to the sync doc as an agent/work and check
     * if we are being coached, if we are, render that in the UI
     * otherwise leave it blank
     */
    const mySyncDoc = `syncDoc.${myWorkerSID}`;
    SyncDoc.getSyncDoc(mySyncDoc).then((doc) => {
      // We are subscribing to Sync Doc updates here and logging anytime that happens
      doc.on('updated', () => {
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
    /*
     * If the supervisor array has value in it, that means someone is coaching
     * We will map each of the supervisors that may be actively coaching
     * Otherwise we will not display anything if no one is actively coaching
     */
    if (this.props.supervisorArray.length !== 0) {
      return (
        <Status>
          <div>
            You are being Coached by:
            <h1 style={{ color: 'green' }}>
              <ol>
                {supervisorArray.map((arr) => (
                  <li key={arr.supervisor}>{arr.supervisor}</li>
                ))}
              </ol>
            </h1>
          </div>
        </Status>
      );
    }

    return <Status />;
  }
}

// Mapping the the logged in user sid so we can snag the Sync Doc
const mapStateToProps = (state) => {
  const myWorkerSID = state?.flex?.worker?.worker?.sid;

  /*
   * Also pulling back the states from the redux store as we will use those later
   * to manipulate the buttons
   */
  const customReduxStore = state?.['barge-coach'].bargecoach;
  const { supervisorArray } = customReduxStore;

  return {
    myWorkerSID,
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
