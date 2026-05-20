import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import patientFormReducer from './slices/patientFormSlice';

function createStorage() {
  try {
    const ls = localStorage;
    const test = '__redux_test__';
    ls.setItem(test, 'test');
    ls.removeItem(test);
    return {
      getItem(key) { return Promise.resolve(ls.getItem(key)); },
      setItem(key, value) { return Promise.resolve(ls.setItem(key, value)); },
      removeItem(key) { return Promise.resolve(ls.removeItem(key)); },
    };
  } catch {
    return {
      getItem() { return Promise.resolve(null); },
      setItem() { return Promise.resolve(); },
      removeItem() { return Promise.resolve(); },
    };
  }
}

const storage = createStorage();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['patientForm'],
};

const rootReducer = combineReducers({
  patientForm: patientFormReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
