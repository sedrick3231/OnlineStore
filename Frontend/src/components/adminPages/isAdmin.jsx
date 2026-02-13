import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function RequireAdmin({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.isAdmin) {
        setLoading(false);
      } else {
        navigate('/');
      }
    };

    checkAdmin();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-gray-800 dark:border-gray-300"></div>
      </div>
    );
  }

  return children;
}
