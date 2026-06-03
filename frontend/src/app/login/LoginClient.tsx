'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const registered = useMemo(() => searchParams.get('registered') === '1', [searchParams]);

  useEffect(() => {
    if (registered) toast.success('Account created. Please log in.');
  }, [registered]);

  useEffect(() => {
    if (store.isAuthenticated) router.replace('/');
  }, [store.isAuthenticated, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await store.login({ email, password });
      router.replace('/');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Use your email and password to access the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full" disabled={submitting || store.isLoading}>
              {submitting || store.isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            {store.error && <p className="text-xs text-danger-400">{store.error}</p>}
          </form>
        </CardContent>
        <CardFooter className="justify-between">
          <p className="text-sm text-muted-foreground">
            New here?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}

