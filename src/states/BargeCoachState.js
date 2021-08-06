const ACTION_SET_BARGE_COACH_STATUS = 'SET_BARGE_COACH_STATUS';
// Set the initial state of the below that we will use to change the buttons and UI
export const initialState = {
  coaching: false,
  enableCoachButton: false,
  muted: true,
  barge: false,
  enableBargeinButton: false,
  supervisorArray: [],
  coachingStatusPanel: true,
};

export class Actions {
  static setBargeCoachStatus = (status) => ({ type: ACTION_SET_BARGE_COACH_STATUS, status });

  static resetBargeCoachStatus = () => ({
    type: ACTION_SET_BARGE_COACH_STATUS,
    status: { ...initialState },
  });
}

// Exporting and adding a reducer for the states we will use later for the buttons
export function reduce(state = initialState, action) {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (action.type) {
    /*
     * Return the extended state and the specific status of the above states
     * it requires you pass the name/value for each you wish to update
     */
    case ACTION_SET_BARGE_COACH_STATUS: {
      return {
        ...state,
        ...action.status,
      };
    }
    // Default case if it doesn't meet the above action
    default:
      return state;
  }
}
