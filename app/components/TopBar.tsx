import React from 'react';
import { useRouter } from 'next/navigation';

const TopBar: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('redtrack_api_key');
    router.push('/');
  };

  return (
    <div className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">RedTrack Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default TopBar; 