import { CircleAlert, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation } from 'react-router-dom';
import SplashScreen from '../components/layout/SplashScreen';
import ThemeToggle from '../components/layout/ThemeToggle';
import Button from '../components/ui/Button';
import { Checkbox, Field, Input } from '../components/ui/Form';
import Logo from '../components/ui/Logo';
import { useUser } from '../context/AuthContext';
import { authErrorMessage, signIn } from '../services/auth';

const YEAR = new Date().getFullYear();

function BrandPanel() {
  return (
    <div className="relative hidden flex-col overflow-hidden bg-[#06130d] p-12 text-white lg:flex">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_0%,rgba(16,185,129,0.30),transparent_70%),radial-gradient(45%_40%_at_100%_100%,rgba(5,150,105,0.20),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]"
      />

      <div className="relative flex items-center gap-3">
        <Logo onDark className="size-10" />
        <span className="text-[15px] font-semibold">Suresh Enterprises</span>
      </div>

      <div className="relative mt-auto max-w-md">
        <p className="font-display text-[56px] leading-[1.02]">
          Every rupee,
          <br />
          <em className="text-emerald-300">accounted for.</em>
        </p>
        <p className="mt-5 text-[15px] leading-relaxed text-white/60">
          Purchase orders, expenses and real net profit, all in one place.
        </p>
      </div>

      <p className="relative mt-16 text-xs text-white/40">© {YEAR} Suresh Enterprises</p>
    </div>
  );
}

export default function Login() {
  const user = useUser();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '', remember: true } });

  if (user === undefined) return <SplashScreen />;
  if (user) return <Navigate to={location.state?.from ?? '/'} replace />;

  // On success the auth listener updates `user` and the redirect above takes over.
  const onSubmit = async ({ email, password, remember }) => {
    try {
      await signIn(email.trim(), password, remember);
    } catch (error) {
      setError('root', { message: authErrorMessage(error) });
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <BrandPanel />

      <div className="flex flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-6 sm:px-8">
        <ThemeToggle className="self-end" />

        <div className="m-auto w-full max-w-sm py-10">
          <Logo className="size-12" />
          <h1 className="mt-8 font-display text-[40px] leading-none text-fg">Welcome back</h1>
          <p className="mt-2 text-[15px] text-muted">
            Sign in to <span className="font-medium text-fg">Suresh Enterprises</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
            {errors.root && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.08] px-3.5 py-3 text-sm text-rose-700 dark:text-rose-300"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                {errors.root.message}
              </div>
            )}

            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={Boolean(errors.email)}
                {...register('email', {
                  required: 'Enter your email',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                })}
              />
            </Field>

            <Field label="Password" htmlFor="password" error={errors.password?.message}>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="pr-11"
                  aria-invalid={Boolean(errors.password)}
                  {...register('password', { required: 'Enter your password' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-faint transition-colors hover:text-fg"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <Checkbox label="Remember me on this device" {...register('remember')} />

            <Button type="submit" loading={isSubmitting} className="w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-faint lg:hidden">© {YEAR} Suresh Enterprises</p>
      </div>
    </div>
  );
}
