import { Notifications as FlexNotifications, NotificationType } from '@twilio/flex-ui';

import logger from './logger';

class Notifications {
  // Twilio Notification class
  #notifications;

  // Custom id to register notifications
  #notificationId;

  constructor(notifications) {
    this.#notifications = notifications;
  }

  /**
   * Register the notifications - should be invoked ASAP in the init method of the plugin
   * @param id the id of the notifications
   */
  _registerNotifications(id) {
    this.#notificationId = id;

    this.#notifications.registeredNotifications.delete(id);
    this.#notifications.registerNotification({
      id,
      content: '',
      type: NotificationType.error,
    });
  }

  error(message) {
    const errorNotification = this.#notifications.registeredNotifications.get(this.#notificationId);
    errorNotification.content = message;
    this.#notifications.showNotification(this.#notificationId);
    logger.error(message);
  }
}

export default new Notifications(FlexNotifications);
