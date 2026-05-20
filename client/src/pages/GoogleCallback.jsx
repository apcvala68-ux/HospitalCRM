import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const mutation = useGoogleLogin();
  const calledRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (calledRef.current) return;
    calledRef.current = true;

    if (error) {
      toast.error('Google login was cancelled');
      navigate('/login', { replace: true });
      return;
    }

    if (code) {
      mutation.mutateAsync({ code })
        .then(() => {
          toast.success('Login successful');
          navigate('/', { replace: true });
        })
        .catch((err) => {
          toast.error(err.message || 'Google login failed');
          navigate('/login', { replace: true });
        });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, mutation, navigate, toast]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
