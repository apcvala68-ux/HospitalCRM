import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  formData: null,
  isDirty: false,
  savedAt: null,
};

const patientFormSlice = createSlice({
  name: 'patientForm',
  initialState,
  reducers: {
    saveForm(state, action) {
      state.formData = action.payload;
      state.isDirty = true;
      state.savedAt = new Date().toISOString();
    },
    clearForm(state) {
      state.formData = null;
      state.isDirty = false;
      state.savedAt = null;
    },
  },
});

export const { saveForm, clearForm } = patientFormSlice.actions;
export default patientFormSlice.reducer;
