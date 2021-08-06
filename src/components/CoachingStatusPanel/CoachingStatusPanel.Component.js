import React from 'react';

import AbstractSyncComponent from '../AbstractSyncComponent';
import { Status } from './CoachingStatusPanel.Style';

export default class CoachingStatusPanel extends AbstractSyncComponent {
  #listenerAdded = false;

  /**
   * Set Supervisor's name that is coaching into props
   * @param doc
   */
  onDocUpdated = (doc) => {
    const supervisorArray = doc.value.data.supervisors === null ? [] : [...doc.value.data.supervisors];
    this.props.setBargeCoachStatus({ supervisorArray });
  };

  componentDidUpdate = async () => {
    // Setup the listener if it hasn't already and we have an workerSid
    if (!this.#listenerAdded && this.props.myWorkerSid) {
      this.#listenerAdded = true;
      await this.setupListener(`syncDoc.${this.props.myWorkerSid}`, this.onDocUpdated);
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
