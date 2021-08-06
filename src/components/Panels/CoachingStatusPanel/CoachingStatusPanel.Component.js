import React from 'react';

import AbstractPanel from '../AbstractPanel';
import { Status } from './CoachingStatusPanel.Style';

export default class CoachingStatusPanel extends AbstractPanel {
  componentDidUpdate = async () => {
    // Setup the listener if it hasn't already and we have an workerSid
    if (!this.doc && this.props.myWorkerSid) {
      await this.setupListener(`syncDoc.${this.props.myWorkerSid}`);
    }
  };

  render() {
    const { supervisorArray } = this.props;

    /*
     * If the supervisor array has value in it, that means someone is coaching
     * We will map each of the supervisors that may be actively coaching
     * Otherwise we will not display anything if no one is actively coaching
     */
    if (supervisorArray.length === 0) {
      return <Status />;
    }

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
}
