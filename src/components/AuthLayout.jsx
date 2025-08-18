import React from 'react';
import { BookOpen } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
     
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="w-full py-4 px-8 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Ritesh Pvt Lmt . All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AuthLayout;
