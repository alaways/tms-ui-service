import { createSlice } from '@reduxjs/toolkit'

interface AppState {
  pageAction?: 'edit' | 'preview' | 'approve' | ''
}

export const initialState: AppState = {
  pageAction: '',
}

const pageStore = createSlice({
  name: 'pageStore',
  initialState: initialState,
  reducers: {
    setPageAction(state, { payload }) {
      payload = payload || state.pageAction
      state.pageAction = payload
    },
  },
})

export const { setPageAction } = pageStore.actions
export default pageStore.reducer