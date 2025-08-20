'use client';

import { useState, useEffect } from 'react';

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('user_id');
      setUserId(storedUserId);
      setIsLoading(false);
    }
  }, []);

  const updateUserId = (newUserId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_id', newUserId);
      setUserId(newUserId);
    }
  };

  const clearUserId = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_id');
      setUserId(null);
    }
  };

  return {
    userId,
    isLoading,
    updateUserId,
    clearUserId
  };
}
