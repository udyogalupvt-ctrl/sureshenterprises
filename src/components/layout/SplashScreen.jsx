import Logo from '../ui/Logo';

export default function SplashScreen() {
  return (
    <div role="status" aria-label="Loading" className="grid min-h-dvh place-items-center">
      <Logo className="size-11 animate-pulse" />
    </div>
  );
}
