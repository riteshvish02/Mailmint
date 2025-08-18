import { configureStore } from '@reduxjs/toolkit'
import userReducer from './reducers/usersReducer'
import domainReducer from './reducers/domainReducer';
import templateReducer from './reducers/templateReducer';
import subsReducer from './reducers/subsReducer';
import mailSettingReducer from './reducers/mailSettingReducer'
export const store = configureStore({
  reducer: {
    User: userReducer,
    domain: domainReducer,
    template:templateReducer,
    subs: subsReducer,
    mailSetting: mailSettingReducer,
  },
})