
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RegisterForm {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerData, setRegisterData] = useState<RegisterForm>({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  const { toast } = useToast();

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login successful",
        description: "You are now logged in.",
        variant: "default",
      });
      // Optionally redirect or close modal
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      // Encryption done in edge function or here? For now, we'll send plain and rely on Supabase triggers and policies for encryption
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            full_name: registerData.fullName,
            phone: registerData.phone,
          }
        },
      });
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration successful",
          description: "Check your email for confirmation.",
          variant: "default",
        });
        setIsLogin(true);
      }
    } catch(e) {
      toast({
        title: "Registration error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#131722] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-[#1A1F2C] border-none">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        {isLogin ? (
          <>
            <label className="block mb-2 text-white text-sm">Email</label>
            <Input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="mb-4 bg-[#2A2F3C] border-none text-white"
            />
            <label className="block mb-2 text-white text-sm">Password</label>
            <Input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="mb-6 bg-[#2A2F3C] border-none text-white"
            />
            <Button onClick={handleLogin} disabled={loading} className="w-full mb-4">
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-[#8E9196] text-center text-sm">
              New here?{' '}
              <button
                className="text-[#9b87f5] underline"
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <label className="block mb-2 text-white text-sm">Full Name</label>
            <Input
              type="text"
              value={registerData.fullName}
              onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
              className="mb-4 bg-[#2A2F3C] border-none text-white"
            />
            <label className="block mb-2 text-white text-sm">Phone</label>
            <Input
              type="text"
              value={registerData.phone}
              onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
              className="mb-4 bg-[#2A2F3C] border-none text-white"
            />
            <label className="block mb-2 text-white text-sm">Email</label>
            <Input
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              className="mb-4 bg-[#2A2F3C] border-none text-white"
            />
            <label className="block mb-2 text-white text-sm">Password</label>
            <Input
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
              className="mb-6 bg-[#2A2F3C] border-none text-white"
            />
            <Button onClick={handleRegister} disabled={loading} className="w-full mb-4">
              {loading ? "Registering..." : "Register"}
            </Button>
            <p className="text-[#8E9196] text-center text-sm">
              Already have an account?{' '}
              <button
                className="text-[#9b87f5] underline"
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </p>
          </>
        )}
      </Card>
    </div>
  );
};

export default Auth;

