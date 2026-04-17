export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex text-gray-900 dark:text-white bg-white dark:bg-gray-950">
      {/* Left side - Decorative/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 opacity-90"></div>
        
        {/* Soft geometric background details */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-70"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-overlay filter blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-50"></div>
        
        <div className="relative z-10 p-12 text-center text-white flex flex-col items-center">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl mb-8 border border-white/20 shadow-2xl">
              {/* Fake logo */}
              <div className="w-16 h-16 bg-gradient-to-tr from-white to-blue-200 rounded-xl flex items-center justify-center shadow-inner">
                <span className="text-blue-700 font-bold text-4xl font-serif">H</span>
              </div>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight drop-shadow-lg">HISAAB</h1>
          <p className="text-xl font-medium text-blue-100 max-w-md mx-auto leading-relaxed drop-shadow-md">
            The elegant solution for accounting, invoicing, and business management.
          </p>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-50 dark:bg-gray-900 -z-10"></div>
        
        {/* Subtle dot pattern background for form side */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0iI2U1ZTVlNSIgZmlsbC1vcGFjaXR5PSIwLjgiLz48L3N2Zz4=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0iIzM3NDE1MSIgZmlsbC1vcGFjaXR5PSIwLjQiLz48L3N2Zz4=')] -z-10 bg-[length:24px_24px]"></div>
        
        <div className="w-full max-w-[440px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 relative z-10 transition-all duration-300">
          {children}
        </div>
      </div>
    </div>
  );
}
