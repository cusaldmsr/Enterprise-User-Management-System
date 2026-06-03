import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Loader2, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { useThemeStore } from '../store/themeStore';

export default function LoginPage() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, toggleTheme } = useThemeStore();

  const [form, setForm] = useState({ email: 'admin@eums.dev', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success('Welcome back!', `Logged in as ${user.firstName} ${user.lastName}`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        axErr?.response?.data?.message ??
        (axErr?.message?.toLowerCase().includes('network')
          ? 'Cannot reach the server — is the backend running on port 5000?'
          : 'Login failed. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 rounded-xl text-muted-foreground"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </Button>

      {/* ── Gradient blobs ─────────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 dark:bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/15 dark:bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-[50%] left-[40%] w-[300px] h-[300px] rounded-full bg-cyan-600/8 dark:bg-cyan-600/10 blur-[100px]" />
      </div>

      {/* ── Card container ─────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[420px] animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40 mb-4">
            <ShieldCheck size={30} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
            EUMS
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Enterprise User Management System</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/60 backdrop-blur-xl shadow-2xl shadow-black/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@eums.dev"
                  required
                  autoFocus
                  className="h-11 bg-muted/50"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="h-11 pr-11 bg-muted/50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-7 w-7"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertCircle size={15} />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit */}
              <Button
                id="login-btn"
                type="submit"
                disabled={loading}
                variant="gradient"
                className="w-full h-11 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In →'
                )}
              </Button>
            </form>

            <Separator className="my-5" />

            {/* Demo Credentials */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <span>🔑</span> Demo Credentials
              </p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Email: <code className="text-primary font-mono">admin@eums.dev</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  Password: <code className="text-primary font-mono">Admin@1234</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground/60 text-xs mt-6">
          Enterprise User Management System © 2024
        </p>
      </div>
    </div>
  );
}
