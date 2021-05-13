import React from 'react';
import { withTheme } from '@twilio/flex-ui';
import styled from '@emotion/styled';

// Used for the custom redux state
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions as BargeCoachStatusAction, } from '../states/BargeCoachState';
import { initialState } from '../states/BargeCoachState';

// Import to get Sync Doc updates
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
    const myWorkerSID = this.props.myWorkerSID;
    let coachingSupervisor = this.props.coachingSupervisor;
    
    // If coachingStatusPanel is true (enabled), proceed
    // otherwise we will not subscribe to the Sync Doc
    // You can toggle this at ../states/BargeCoachState
    const coachingStatusPanel = initialState.coachingStatusPanel;
    if (coachingStatusPanel) {
      const mySyncDoc = `syncDoc.${myWorkerSID}`;
      console.log(`${mySyncDoc}`);
      SyncDoc.getSyncDoc(mySyncDoc)
      .then(doc => {
        console.log(doc.value);
        // We are subscribing to Sync Doc updates here and logging anytime that happens
        doc.on("updated", updatedDoc => {
          console.log("Sync Doc Update Recieved: ", updatedDoc.value);
          coachingSupervisor = doc.value.data.supervisor;
          console.log(`Supervisor = ${coachingSupervisor}`);
          
          // Set Supervisor's name that is coaching into props
          this.props.setBargeCoachStatus({ 
            supervisorName: coachingSupervisor
          });
        })
      });
      return (
        <Status> 
          {this.props.supervisorName != "" && 
            <h1>You are being Coached by: 
              <h2 style={{ "color": 'green' }}>
                {this.props.supervisorName}
              </h2>
            </h1>
          }
        </Status>
      );
    }
    return (
      <Status>
      </Status>
    );
  }
}

// Mapping the the logged in user sid so we can snag the Sync Doc
const mapStateToProps = (state) => {
  const myWorkerSID = state?.flex?.worker?.worker?.sid;

  // Also pulling back the states from the redux store as we will use those later
  // to manipulate the buttons
  const customReduxStore = state?.['barge-coach'].bargecoach;
  const supervisorName = customReduxStore.supervisorName;
  
  return {
    myWorkerSID,
    supervisorName,
  };
};

// Mapping dispatch to props as I will leverage the setBargeCoachStatus
// to change the properties on the redux store, referenced above with this.props.setBargeCoachStatus
const mapDispatchToProps = (dispatch) => ({
  setBargeCoachStatus: bindActionCreators(BargeCoachStatusAction.setBargeCoachStatus, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(CoachingStatusPanel));