import React from 'react';

import { syncClient } from '../../services';

export default class AbstractPanel extends React.Component {
  doc = null;

  /**
   * Set Supervisor's name that is coaching into props
   * @param doc
   */
  #onDocUpdated = (doc) => {
    const supervisorArray = doc.value.data.supervisors === null ? [] : [...doc.value.data.supervisors];
    this.props.setBargeCoachStatus({ supervisorArray });
  };

  /**
   * Sets up the doc listener
   * @param docName the doc name to listen to
   */
  setupListener = async (docName) => {
    /*
     * Let's subscribe to the sync doc as an agent/work and check
     * if we are being coached, if we are, render that in the UI
     * otherwise leave it blank
     */
    this.doc = await syncClient.getSyncDoc(docName);

    // We are subscribing to Sync Doc updates here and logging anytime that happens
    this.doc.on('updated', this.#onDocUpdated);
  };

  /**
   * Unregister event listeners upon dismounting
   */
  componentWillUnmount() {
    if (this.doc) {
      this.doc.off('updated', this.#onDocUpdated);
    }
  }

  render() {
    throw new Error('Method is not implemented');
  }
}
