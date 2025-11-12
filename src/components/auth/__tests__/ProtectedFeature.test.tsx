import { render, screen } from '@testing-library/react';
import { ProtectedFeature } from '../ProtectedFeature';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');
jest.mock('../LoginModal', () => ({
  LoginModal: () => <div>LoginModal</div>,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProtectedFeature', () => {
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

    const { container } = render(
      <ProtectedFeature>
        <div>Protected Content</div>
      </ProtectedFeature>
    );
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows sign in prompt when user is not authenticated', () => {
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

    render(
      <ProtectedFeature
        title="Test Feature"
        description="Test description"
      >
        <div>Protected Content</div>
      </ProtectedFeature>
    );
    
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows protected content when user is authenticated', () => {
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

    render(
      <ProtectedFeature>
        <div>Protected Content</div>
      </ProtectedFeature>
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
  });
});

