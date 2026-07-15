import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Mail, KeyRound, ArrowRight, ScanFace, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute('/')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('alex@deskmate.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [biometricState, setBiometricState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [biometricError, setBiometricError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.loginWithEmail(email, password);
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricState('scanning');
    setBiometricError(null);
    try {
      await authService.loginWithBiometric();
      setBiometricState('success');
      setTimeout(() => {
        navigate({ to: '/dashboard' });
      }, 1000);
    } catch (err: any) {
      setBiometricState('error');
      setBiometricError(err.message);
      setTimeout(() => {
        setBiometricState('idle');
      }, 3500);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Brand & Imagery (Hidden on small screens) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-950 text-white p-12 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight">DeskMate.</span>
        </div>

        <div className="relative z-10 max-w-lg mt-auto mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold leading-tight mb-6"
          >
            Manage your workspace with unparalleled elegance.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-zinc-400 mb-8"
          >
            Access control, automated billing, and insightful analytics—all in one premium platform.
          </motion.p>
          
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?u=a" alt="User" className="w-10 h-10 rounded-full border-2 border-zinc-950" />
              <img src="https://i.pravatar.cc/100?u=b" alt="User" className="w-10 h-10 rounded-full border-2 border-zinc-950" />
              <img src="https://i.pravatar.cc/100?u=c" alt="User" className="w-10 h-10 rounded-full border-2 border-zinc-950" />
            </div>
            <p>Trusted by 500+ premium coworking spaces worldwide.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Forms */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 relative">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your DeskMate account.</p>
          </div>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="email">Email Login</TabsTrigger>
              <TabsTrigger value="biometric">Biometric</TabsTrigger>
            </TabsList>
            
            {/* Email Login Tab */}
            <TabsContent value="email">
              <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                <CardHeader className="hidden sm:block">
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>Enter your email and password to access the portal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4 sm:pt-0">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Access Denied</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          placeholder="name@example.com" 
                          type="email" 
                          className="pl-9"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
                      </div>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password" 
                          className="pl-9"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Demo Hint */}
              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>Demo Accounts:</p>
                <div className="flex flex-col gap-1 mt-2">
                  <span><strong className="text-foreground">Super Admin:</strong> alex@deskmate.com</span>
                  <span><strong className="text-foreground">Active Member:</strong> sarah@startup.io</span>
                  <span><strong className="text-foreground">Expired Member:</strong> michael@expired.co</span>
                </div>
              </div>
            </TabsContent>

            {/* Biometric Login Tab */}
            <TabsContent value="biometric">
              <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                <CardHeader className="text-center pb-2">
                  <CardTitle>Biometric Access</CardTitle>
                  <CardDescription>Place your finger on the scanner or look at the camera.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-8">
                  
                  <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {biometricState === 'idle' && (
                        <motion.div 
                          key="idle"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={handleBiometricLogin}
                        >
                          <Fingerprint className="w-12 h-12" />
                        </motion.div>
                      )}
                      
                      {biometricState === 'scanning' && (
                        <motion.div 
                          key="scanning"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="relative w-24 h-24 flex items-center justify-center text-primary"
                        >
                          <ScanFace className="w-12 h-12" />
                          <motion.div 
                            className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          />
                        </motion.div>
                      )}

                      {biometricState === 'success' && (
                        <motion.div 
                          key="success"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600"
                        >
                          <CheckCircle2 className="w-12 h-12" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {biometricState === 'idle' && (
                    <Button variant="outline" onClick={handleBiometricLogin}>
                      Simulate Scanner
                    </Button>
                  )}
                  {biometricState === 'scanning' && <p className="text-sm text-muted-foreground animate-pulse">Scanning...</p>}
                  {biometricState === 'success' && <p className="text-sm font-medium text-green-600">Authentication successful!</p>}

                  {biometricError && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 w-full"
                    >
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Access Denied</AlertTitle>
                        <AlertDescription>{biometricError}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}

