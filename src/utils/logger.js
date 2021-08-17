import { format } from 'util';

class Logger {
  _prefix = '';

  /**
   * Sets the prefix
   * @param prefix the prefix of the logger
   */
  _setPrefix = (prefix) => (this._prefix = prefix);

  /**
   * info level log
   * @param messages
   */
  log = (...messages) => {
    this.#_log({ level: 'info', messages });
  };

  /**
   * debug level log
   * @param messages
   */
  debug = (...messages) => {
    this.#_log({ level: 'debug', messages });
  };

  /**
   * error level log
   * @param messages
   */
  error = (...messages) => {
    this.#_log({ level: 'error', messages });
  };

  /**
   * Internal method for logging
   * @param level the console log level
   * @param messages
   * @private
   */
  #_log = ({ level, messages }) => {
    if (!messages) {
      messages = [];
    }
    messages.unshift(`${this._prefix} ::`);

    // eslint-disable-next-line no-console
    console[level](format.apply({}, messages));
  };
}

export default new Logger();
