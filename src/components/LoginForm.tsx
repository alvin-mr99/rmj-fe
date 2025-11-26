import { createSignal } from 'solid-js';
import { Show } from 'solid-js';

interface LoginFormProps {
  onLoginSuccess: (email: string) => void;
}

export function LoginForm(props: LoginFormProps) {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [emailError, setEmailError] = createSignal('');
  const [passwordError, setPasswordError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);

  const validateEmail = (email: string): boolean => {
    // Check if email ends with @gmail.com
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validate email
    if (!email()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email())) {
      setEmailError('Email must be a valid Gmail address (@gmail.com)');
      return;
    }

    // Validate password
    if (!password()) {
      setPasswordError('Password is required');
      return;
    }

    if (password().length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    // Simulate loading
    setIsLoading(true);
    
    setTimeout(() => {
      // Save to localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email());
      
      setIsLoading(false);
      props.onLoginSuccess(email());
    }, 500);
  };

  return (
    <div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Login Card */}
      <div class="w-full max-w-md">
        {/* Login Form Container */}
        <div class="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p class="text-gray-500 text-sm">Enter your credentials to access your account.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} class="space-y-6">
            {/* Email Input */}
            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="text-blue-500 text-lg">✉️</span>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email()}
                  onInput={(e) => {
                    setEmail(e.currentTarget.value);
                    setEmailError('');
                  }}
                  placeholder="your.email@gmail.com"
                  class={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-base transition-all duration-200 focus:outline-none ${
                    emailError() 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 bg-white'
                  }`}
                />
              </div>
              <Show when={emailError()}>
                <p class="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {emailError()}
                </p>
              </Show>
            </div>

            {/* Password Input */}
            <div>
              <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="text-blue-500 text-lg">🔒</span>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password()}
                  onInput={(e) => {
                    setPassword(e.currentTarget.value);
                    setPasswordError('');
                  }}
                  placeholder="Enter your password"
                  class={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-base transition-all duration-200 focus:outline-none ${
                    passwordError() 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 bg-white'
                  }`}
                />
              </div>
              <Show when={passwordError()}>
                <p class="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {passwordError()}
                </p>
              </Show>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading()}
              class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold text-base shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Show when={isLoading()} fallback="Sign In">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              </Show>
            </button>
          </form>

          {/* Footer */}
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-500">
              Forgot your password?{' '}
              <button 
                type="button"
                class="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                onClick={() => alert('Please contact your administrator')}
              >
                Reset Password
              </button>
            </p>
          </div>
        </div>

        {/* Info Note */}
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-400">
            Underground Cable Management System v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
