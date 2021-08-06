import React from 'react';

import { syncClient } from '../services';

export default class AbstractSyncComponent extends React.Component {
  #listeners = [];

  /**
   * Sets up the doc listener
   * @param docName the doc name to listen to
   * @param callback the callback listener to invoke on doc update
   */
  setupListener = async (docName, callback) => {
    /*
     * Let's subscribe to the sync doc as an agent/work and check
     * if we are being coached, if we are, render that in the UI
     * otherwise leave it blank
     */
    const doc = await syncClient.getSyncDoc(docName);
    doc.on('updated', callback);

    this.#listeners.push({ doc, callback });
  };

  /**
   * Unregister event listeners upon dismounting
   */
  componentWillUnmount() {
    this.#listeners.forEach(({ doc, callback }) => {
      doc.off('updated', callback);
    });
  }

  render() {
    throw new Error('Method is not implemented');
  }
}
