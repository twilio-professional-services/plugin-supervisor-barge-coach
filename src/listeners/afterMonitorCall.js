import { Actions } from '@twilio/flex-ui';

import { logger } from '../utils';
import { Actions as BargeCoachStatusAction } from '../states/BargeCoachState';

/**
 * Listening for supervisor to monitor the call to enable the barge and coach buttons,
 * as well as reset their muted/coaching states
 *
 * @param manager { import('@twilio/flex-ui').Manager }
 */
export default function afterMonitorCall(manager) {
  Actions.addListener('afterMonitorCall', () => {
    logger.log(`Monitor button triggered, enable the Coach and Barge-In Buttons`);

    manager.store.dispatch(
      BargeCoachStatusAction.setBargeCoachStatus({
        enableCoachButton: true,
        coaching: false,
        enableBargeinButton: true,
        muted: true,
      }),
    );
  });
}
