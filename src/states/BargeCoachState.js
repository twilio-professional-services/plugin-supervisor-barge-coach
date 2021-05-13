const ACTION_SET_BARGE_COACH_STATUS = 'SET_BARGE_COACH_STATUS';
// Set the initial state of the below that we will use to change the buttons
export const initialState = {
    coaching: false,
    enableCoachButton: false,
    muted: true,
    barge: false,
    enableBargeinButton: false,
    supervisorName: "",
    // Toggle coachingStatusPanel feature - the ability for the agent to see who is coaching them
    // true = enabled, false = disabled
    coachingStatusPanel: true
};

export class Actions {
    static setBargeCoachStatus = (status) => ({ type: ACTION_SET_BARGE_COACH_STATUS, status });
  };

// Exporting and adding a reducer for the states we will use later for the buttons
export function reduce(state = initialState, action) {
    switch (action.type) {
        // Return the extended state and the specific status of the above states
        // it requires you pass the name/value for each you wish to update
        case ACTION_SET_BARGE_COACH_STATUS: {
            return {
                ...state,
                ...action.status
            }
        }
        // If they unmonitor, we want to go back to the initial state
        default:
            return state;
    }
};
  
