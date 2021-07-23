import { combineReducers } from 'redux';

import { reduce as BargeCoachReducer } from './BargeCoachState';

// Register your redux store under a unique namespace
export const namespace = 'barge-coach';

// Combine the reducers
export default combineReducers({
  bargecoach: BargeCoachReducer,
});
