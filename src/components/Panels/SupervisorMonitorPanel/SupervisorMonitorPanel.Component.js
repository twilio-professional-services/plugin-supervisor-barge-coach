import * as React from 'react';

import AbstractPanel from '../AbstractPanel';
import { Status } from './SupervisorMonitorPanel.Style';

export default class SupervisorMonitorPanel extends AbstractPanel {
  componentDidUpdate = async () => {
    // Setup the listener if it hasn't already and we have an agentSid
    if (!this.doc && this.props.agentWorkerSid) {
      await this.setupListener(`syncDoc.${this.props.agentWorkerSid}`);
    }
  };

  render() {
    return (
      <Status>
        <div>
          <h1 id="title">Active Supervisors:</h1>
          {this.renderSupervisors()}
        </div>
      </Status>
    );
  }

  renderSupervisors() {
    if (this.props.supervisorArray.length === 0) {
      return 'None';
    }

    return (
      <table id="supervisors">
        <tbody>
          {this.props.supervisorArray.map((supervisorArray) => (
            <tr key={supervisorArray.supervisor}>
              <td>{supervisorArray.supervisor}</td>
              <td style={{ color: 'green' }}>&nbsp;{supervisorArray.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
