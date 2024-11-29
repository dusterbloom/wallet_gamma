export const GooglePayButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-white text-black rounded-full py-3 px-6
               flex items-center justify-center space-x-2
               transition-all duration-200 hover:bg-gray-100 active:scale-98"
  >
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path
        fill="currentColor"
        d="M12 24c6.6 0 12-5.4 12-12S18.6 0 12 0 0 5.4 0 12s5.4 12 12 12z"
      />
      <path
        fill="#4285F4"
        d="M12.2 10.5c-.7 0-1.3.6-1.3 1.3v3.5c0 .7.6 1.3 1.3 1.3s1.3-.6 1.3-1.3v-3.5c0-.7-.6-1.3-1.3-1.3z"
      />
      <path
        fill="#34A853"
        d="M15.5 13.5c0-.7-.6-1.3-1.3-1.3s-1.3.6-1.3 1.3v1.3c0 .7.6 1.3 1.3 1.3s1.3-.6 1.3-1.3v-1.3z"
      />
      <path
        fill="#FBBC04"
        d="M8.9 13.5c0-.7-.6-1.3-1.3-1.3s-1.3.6-1.3 1.3v1.3c0 .7.6 1.3 1.3 1.3s1.3-.6 1.3-1.3v-1.3z"
      />
      <path
        fill="#EA4335"
        d="M12.2 7.2c-.7 0-1.3.6-1.3 1.3v1.3c0 .7.6 1.3 1.3 1.3s1.3-.6 1.3-1.3V8.5c0-.7-.6-1.3-1.3-1.3z"
      />
    </svg>
    <span className="font-medium">Pay</span>
  </button>
);
