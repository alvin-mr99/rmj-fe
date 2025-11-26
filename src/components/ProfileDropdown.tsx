import { createSignal, Show, onCleanup } from 'solid-js';

interface ProfileDropdownProps {
    userEmail: string;
    onLogout: () => void;
}

export function ProfileDropdown(props: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = createSignal(false);
    const [showProfileDetail, setShowProfileDetail] = createSignal(false);
    let dropdownRef: HTMLDivElement | undefined;

    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
            setIsOpen(false);
        }
    };

    // Add event listener when dropdown is open
    const toggleDropdown = () => {
        const newState = !isOpen();
        setIsOpen(newState);

        if (newState) {
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }
    };

    onCleanup(() => {
        document.removeEventListener('click', handleClickOutside);
    });

    const getInitials = (email: string): string => {
        return email.substring(0, 2).toUpperCase();
    };

    const getDisplayName = (email: string): string => {
        const username = email.split('@')[0];
        // Convert username to title case
        return username.charAt(0).toUpperCase() + username.slice(1).replace(/[._-]/g, ' ');
    };

    const handleLogout = () => {
        setIsOpen(false);
        props.onLogout();
    };

    const handleProfileClick = () => {
        setIsOpen(false);
        setShowProfileDetail(true);
    };

    return (
        <>
            <div class="relative" ref={dropdownRef}>
                {/* Profile Button */}
                <button
                    onClick={toggleDropdown}
                    class={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${isOpen()
                            ? 'bg-white shadow-lg border-2 border-blue-500'
                            : 'bg-white hover:bg-gray-50 shadow-md border-2 border-transparent'
                        }`}
                >
                    {/* Avatar */}
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {getInitials(props.userEmail)}
                    </div>

                    {/* Chevron Icon */}
                    <svg
                        class={`w-5 h-5 text-gray-700 transition-transform duration-200 ${isOpen() ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                <Show when={isOpen()}>
                    <div class="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[2000] animate-[slideDown_0.2s_ease-out]">
                        {/* Profile Header */}
                        <div class="px-5 py-4 bg-gradient-to-br from-gray-50 to-white">
                            <div class="flex items-center gap-3">
                                <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {getInitials(props.userEmail)}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="text-base font-bold text-gray-900 mb-0.5 leading-tight">
                                        {getDisplayName(props.userEmail)}
                                    </h3>
                                    <p class="text-xs text-gray-500 truncate">
                                        {props.userEmail}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div class="py-2">
                            {/* Profile */}
                            <button
                                class="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150 group"
                                onClick={handleProfileClick}
                            >
                                <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                    <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold text-gray-900">Profile</p>
                                </div>
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Settings */}
                            <button
                                class="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150 group"
                                onClick={() => {
                                    setIsOpen(false);
                                    alert('Settings feature coming soon!');
                                }}
                            >
                                <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                    <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold text-gray-900">Settings</p>
                                </div>
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Divider */}
                            <div class="my-2 mx-4 border-t border-gray-200"></div>

                            {/* Logout */}
                            <button
                                class="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-red-50 transition-colors duration-150 group"
                                onClick={handleLogout}
                            >
                                <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold text-red-600">Logout</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </Show>
            </div>

            {/* Profile Detail Modal */}
            <Show when={showProfileDetail()}>
                <div
                    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[3000] p-4 overflow-y-auto"
                    onClick={() => setShowProfileDetail(false)}
                >
                    <div
                        class="w-full max-w-lg mt-8 mb-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Profile Detail Card */}
                        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden animate-[slideDown_0.3s_ease-out]">
                            {/* Header */}
                            <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                                <button
                                    onClick={() => setShowProfileDetail(false)}
                                    class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span class="font-semibold">Back</span>
                                </button>
                            </div>

                            {/* Content */}
                            <div class="p-5">
                                {/* Title */}
                                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-5">
                                    <h2 class="text-xl font-bold text-blue-600 m-0">Profile Information</h2>
                                </div>

                                {/* Avatar Section */}
                                <div class="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 mb-5 flex flex-col items-center">
                                    <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl mb-3">
                                        {getInitials(props.userEmail)}
                                    </div>
                                    <button class="text-xs font-semibold text-gray-600 px-5 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors">
                                        Change Photo
                                    </button>
                                </div>

                                {/* Information Fields */}
                                <div class="space-y-3">
                                    {/* Full Name */}
                                    <div>
                                        <label class="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                                            Full Name
                                        </label>
                                        <div class="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                                            <p class="text-sm font-semibold text-gray-900 m-0">
                                                {getDisplayName(props.userEmail)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email Address */}
                                    <div>
                                        <label class="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                                            Email Address
                                        </label>
                                        <div class="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                                            <p class="text-sm font-semibold text-gray-900 m-0">
                                                {props.userEmail}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label class="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                                            Role
                                        </label>
                                        <div class="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                                            <p class="text-sm font-semibold text-gray-900 m-0">
                                                Administrator
                                            </p>
                                        </div>
                                    </div>

                                    {/* Department */}
                                    <div>
                                        <label class="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                                            Department
                                        </label>
                                        <div class="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                                            <p class="text-sm font-semibold text-gray-900 m-0">
                                                Network Operations
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Show>
        </>
    );
}
