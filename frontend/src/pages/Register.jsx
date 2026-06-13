import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiEye, HiEyeOff } from 'react-icons/hi';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerForm, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const { register } = useAuth();
  const navigate = useNavigate();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role
      });
      toast.success('Registration successful!');
      navigate(data.role === 'pharmacy' ? '/pharmacy/dashboard' : '/search');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full bg-surface-50 dark:bg-surface-950 -z-20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen"></div>

      <div className="max-w-md w-full glass-card p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-xl shadow-glow">
              +
            </div>
            <span className="font-display font-bold text-2xl">
              <span className="gradient-text">Med</span>Locator
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Create an account</h2>
          <p className="text-sm text-surface-500 mt-2">Join us to find or list rare medicines</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">Account Type</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input type="radio" value="user" className="peer sr-only" defaultChecked {...registerForm('role')} />
                <div className="text-center py-2 px-4 rounded-xl border-2 border-surface-200 dark:border-surface-700 peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 text-surface-600 dark:text-surface-400 peer-checked:text-primary-600 dark:peer-checked:text-primary-400 font-medium transition-all">
                  Patient / User
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" value="pharmacy" className="peer sr-only" {...registerForm('role')} />
                <div className="text-center py-2 px-4 rounded-xl border-2 border-surface-200 dark:border-surface-700 peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 text-surface-600 dark:text-surface-400 peer-checked:text-primary-600 dark:peer-checked:text-primary-400 font-medium transition-all">
                  Pharmacy
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineUser className="h-5 w-5 text-surface-400" />
              </div>
              <input
                type="text"
                {...registerForm('name', { required: 'Name is required' })}
                className="input-field pl-10"
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineMail className="h-5 w-5 text-surface-400" />
              </div>
              <input
                type="email"
                {...registerForm('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
                className="input-field pl-10"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">Phone Number (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlinePhone className="h-5 w-5 text-surface-400" />
              </div>
              <input
                type="tel"
                {...registerForm('phone')}
                className="input-field pl-10"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-surface-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...registerForm('password', { 
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-400 hover:text-surface-600"
              >
                {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-surface-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...registerForm('confirmPassword', { 
                  validate: value => value === password || 'Passwords do not match'
                })}
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center mt-6"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
