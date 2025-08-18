import React from 'react';

const Loader = () => {
  return (
    <div className="h-screen w-screen bg-white flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
