import { useState, type FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export function SignUpPage() {
  const [searchParams] = useSearchParams();
  const referer = searchParams.get('referer') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/login?referer=${encodeURIComponent(referer)}`;
    const emailInput = document.createElement('input');
    emailInput.type = 'text';
    emailInput.name = 'email';
    emailInput.value = email;
    form.appendChild(emailInput);
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.name = 'password';
    passwordInput.value = password;
    form.appendChild(passwordInput);
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[var(--yt-text)] mb-2 text-center">
          Create your account
        </h1>
        <p className="text-sm text-[var(--yt-text-secondary)] mb-6 text-center">
          Use your email and a password. If an account exists, you&apos;ll be signed in instead.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--yt-text-secondary)] mb-1">
              Email or User ID
            </label>
            <input
              id="email"
              type="text"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-[var(--yt-bg-secondary)] border border-[var(--yt-border)] text-[var(--yt-text)] outline-none focus:border-[var(--yt-accent)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--yt-text-secondary)] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-[var(--yt-bg-secondary)] border border-[var(--yt-border)] text-[var(--yt-text)] outline-none focus:border-[var(--yt-accent)]"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[var(--yt-accent)] text-white font-medium hover:bg-[var(--yt-accent-hover)]"
          >
            Create account
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--yt-text-secondary)]">
          Already have an account?{' '}
          <Link to={`/login?referer=${encodeURIComponent(referer)}`} className="text-[var(--yt-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
