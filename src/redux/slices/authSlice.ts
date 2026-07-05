import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  image?: string;
}

interface AuthState {
  user: UserPayload | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserPayload; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    updateUserImage: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.image = action.payload;
      }
    },
  },
});

export const { setCredentials, logout, updateUserImage } = authSlice.actions;
export default authSlice.reducer;
