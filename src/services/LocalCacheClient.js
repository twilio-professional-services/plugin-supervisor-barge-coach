import { logger } from '../utils';

class LocalCacheClient {
  setTeamViewPath = (value) => this.#set('teamViewPath', value);

  getTeamViewPath = () => this.#get('teamViewPath');

  setAgentSyncDoc = (value) => this.#set('agentSyncDoc', value);

  getAgentSyncDoc = () => this.#get('agentSyncDoc');

  setPrivateToggle = (value) => this.#set('privateToggle', value);

  getPrivateToggle = () => this.#get('privateToggle');

  #set(key, value) {
    logger.debug(`Storing ${key} with value ${value} to localStorage`);
    localStorage.setItem(key, value);
  }

  #get(key) {
    logger.debug(`Getting ${key} from localStorage`);

    return localStorage.getItem(key);
  }
}

export default new LocalCacheClient();
