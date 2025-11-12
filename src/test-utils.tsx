import { render, RenderOptions } from '@testing-library/react';
import { AuthContext } from '@/components/auth/AuthProvider';
import { AuthContextType } from '@/types/auth.types';

export const mockAuthContext: AuthContextType = {
  user: { id: '123', email: 'test@example.com' } as any,
  session: {} as any,
  profile: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signInWithOAuth: jest.fn(),
  signOut: jest.fn(),
  refreshProfile: jest.fn(),
};

export const renderWithAuth = (
  ui: React.ReactElement,
  options?: RenderOptions
) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {ui}
    </AuthContext.Provider>,
    options
  );
};

