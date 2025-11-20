import { render, screen } from '@testing-library/react';
import { AuthButton } from '../AuthButton';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');
jest.mock('../UserMenu', () => ({
  UserMenu: () => <div>UserMenu</div>,
}));
jest.mock('../LoginModal', () => ({
  LoginModal: () => <div>LoginModal</div>,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AuthButton', () => {
  it('shows loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      profile: null,
      loading: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      refreshProfile: jest.fn(),
    });

    const { container } = render(<AuthButton />);
    
    const loadingElement = container.querySelector('.animate-pulse');
    expect(loadingElement).toBeInTheDocument();
  });

  it('shows Login button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      profile: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      refreshProfile: jest.fn(),
    });

    render(<AuthButton />);
    
    expect(screen.getByRole('button', { name: /sign in to your account/i })).toBeInTheDocument();
  });

  it('shows UserMenu when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123', email: 'test@example.com' } as any,
      session: {} as any,
      profile: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      refreshProfile: jest.fn(),
    });

    render(<AuthButton />);
    
    expect(screen.getByText('UserMenu')).toBeInTheDocument();
  });
});

