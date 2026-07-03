import { useCallback, useState } from 'react';

function getErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong';
}

export function useDataTableAsyncState(initialLoading = true) {
  const [loading, setLoading] = useState(initialLoading);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const runWithLoading = useCallback(async (action, options = {}) => {
    const { mapError = getErrorMessage } = options;

    try {
      setLoading(true);
      setError(null);
      return await action();
    } catch (err) {
      setError(mapError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
 
  const runWithSaving = useCallback(async (action) => {
    try {
      setSaving(true);
      return await action();
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    loading,
    saving,
    error,
    setError,
    clearError,
    runWithLoading,
    runWithSaving,
  };
}

