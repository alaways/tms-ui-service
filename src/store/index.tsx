import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import themeConfigSlice from './themeConfigSlice'
import dataStore from './dataStore'
import pageStore from './pageStore'

const persistConfig = {
  key: 'root',
  storage,
}

const rootReducer = combineReducers({
  themeConfig: themeConfigSlice,
  dataStore: dataStore,
  pageStore: pageStore
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: {
    // Ignore these action types
    ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
    // Ignore these paths in the state
    ignoredPaths: ['_persist'],
  },
})

const store = configureStore({
  reducer: persistedReducer,
  middleware: customizedMiddleware,
})

const persistor = persistStore(store)

export { store, persistor }
export type IRootState = ReturnType<typeof rootReducer>
