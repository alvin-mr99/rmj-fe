import { createSignal } from 'solid-js';
import { Show } from 'solid-js';
import backgroundImage from '../assets/image.png';

interface LoginFormProps {
  onLoginSuccess: (email: string) => void;
}

export function LoginForm(props: LoginFormProps) {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [emailError, setEmailError] = createSignal('');
  const [passwordError, setPasswordError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [rememberMe, setRememberMe] = createSignal(false);

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
    <div class="min-h-screen w-full flex">
      {/* Left Side - Background Image with Info */}
      <div 
        class="hidden lg:flex lg:w-1/2 xl:w-3/5 relative bg-cover bg-center"
        style={`background-image: url(${backgroundImage});`}
      >
        {/* Overlay */}
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-700/70 to-blue-600/80"></div>
        
        {/* Content */}
        <div class="relative z-10 flex flex-col justify-between p-8 text-white w-full">
          {/* Logo & Brand */}
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-base font-bold">SmartWFM RMJ</h2>
              <p class="text-blue-200 text-xs">TelkomInfra</p>
            </div>
          </div>

          {/* Main Content */}
          <div class="space-y-6">
            <div>
              <h1 class="text-3xl font-bold mb-3 leading-tight">
                REGIONAL METRO<br />JUNCTION
              </h1>
              <p class="text-blue-100 text-sm max-w-lg leading-relaxed">
                Digitalisasi survey lapangan untuk instalasi kabel OSP dengan dukungan spasial, BOQ generator, dan validasi foto evidence.
              </p>
            </div>

            {/* Features */}
            <div class="space-y-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-sm">KML Route Management</h3>
                  <p class="text-blue-200 text-xs">Visualisasi & edit rute kabel existing</p>
                </div>
              </div>

              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-sm">Photo Evidence</h3>
                  <p class="text-blue-200 text-xs">Foto galian dengan GPS & metadata</p>
                </div>
              </div>

              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-sm">BOQ Generator</h3>
                  <p class="text-blue-200 text-xs">Auto-calculate material & cost</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div class="flex gap-6 pt-4">
              <div>
                <div class="text-2xl font-bold">3 km</div>
                <div class="text-blue-200 text-xs">Handhole Spacing</div>
              </div>
              <div>
                <div class="text-2xl font-bold">1.5m</div>
                <div class="text-blue-200 text-xs">Standard Depth</div>
              </div>
              <div>
                <div class="text-2xl font-bold">100%</div>
                <div class="text-blue-200 text-xs">Offline Support</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div class="flex gap-6 text-xs text-blue-200">
            <span>Survey Lapangan</span>
            <span>BOQ Management</span>
            <span>Reporting</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div class="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 bg-white">
        <div class="w-full max-w-md">
          {/* Mobile Logo */}
          <div class="lg:hidden flex items-center justify-center gap-2.5 mb-6">
            <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-base font-bold text-gray-900">SmartWFM RMJ</h2>
              <p class="text-blue-600 text-xs">Ring Management Junction</p>
            </div>
          </div>

          {/* Login Header */}
          <div class="text-center lg:text-left mb-6">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full mb-3">
              <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span class="text-xs text-blue-700 font-medium">Login</span>
            </div>
            <h1 class="text-xl font-bold text-gray-900 mb-1">
              OSP Survey & BOQ Management
            </h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} class="space-y-4">
            {/* Email Input */}
            <div>
              <label for="email" class="block text-xs font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email()}
                  onInput={(e) => {
                    setEmail(e.currentTarget.value);
                    setEmailError('');
                  }}
                  placeholder="Enter your email"
                  class={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    emailError() 
                      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
                  }`}
                />
              </div>
              <Show when={emailError()}>
                <p class="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  {emailError()}
                </p>
              </Show>
            </div>

            {/* Password Input */}
            <div>
              <label for="password" class="block text-xs font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
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
                  class={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    passwordError() 
                      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
                  }`}
                />
              </div>
              <Show when={passwordError()}>
                <p class="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  {passwordError()}
                </p>
              </Show>
            </div>

            {/* Remember Me & Quick Access */}
            <div class="flex items-center justify-between">
              <label class="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe()}
                  onChange={(e) => setRememberMe(e.currentTarget.checked)}
                  class="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span class="ml-2 text-xs text-gray-600">Remember me</span>
              </label>
              <button 
                type="button"
                class="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                onClick={() => alert('Please contact your administrator')}
              >
                Quick Access
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading()}
              class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm shadow-md hover:bg-blue-700 transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Show when={isLoading()} fallback={
                <>
                  Sign In
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              }>
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </Show>
            </button>
          </form>

          {/* Footer */}
          <div class="mt-6 text-center">
            <p class="text-xs text-gray-500">
              Don't have an account?{' '}
              <button 
                type="button"
                class="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                onClick={() => alert('Please contact your administrator to register')}
              >
                Register here
              </button>
            </p>
          </div>

          {/* Version Info */}
          <div class="mt-4 text-center">
            <p class="text-xs text-gray-400">
              SmartWFM RMJ for TelkomInfra v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
