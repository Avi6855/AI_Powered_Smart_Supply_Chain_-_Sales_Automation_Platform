'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Role, SignupRequest } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const roles: { label: string; value: Role }[] = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Sales Manager', value: 'SALES_MANAGER' },
  { label: 'Warehouse Manager', value: 'WAREHOUSE_MANAGER' },
  { label: 'Analyst', value: 'ANALYST' },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [form, setForm] = useState<SignupRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ADMIN',
    phone: '',
    department: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const passwordMismatch = useMemo(() => {
    if (!form.password || !form.confirmPassword) return false;
    return form.password !== form.confirmPassword;
  }, [form.password, form.confirmPassword]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMismatch) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await signup({
        ...form,
        phone: form.phone?.trim() || undefined,
        department: form.department?.trim() || undefined,
      });
      router.replace('/login?registered=1');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Create a new account to access the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                required
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />

            <Select
              label="Role"
              value={form.role}
              onChange={(value) => setForm((p) => ({ ...p, role: value as Role }))}
              options={roles}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                error={passwordMismatch ? 'Passwords do not match' : undefined}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone (Optional)"
                value={form.phone ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
              <Input
                label="Department (Optional)"
                value={form.department ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-between">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}

