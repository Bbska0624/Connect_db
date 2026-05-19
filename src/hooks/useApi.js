import { useState, useCallback } from 'react';

// Generic hook that wraps any service function with loading + error state.
//
// Usage:
//   const { loading, error, execute } = useApi(someService.doThing);
//   const result = await execute(arg1, arg2);

const useApi = (apiFn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      if (!res.success) setError(res.message);
      return res;
    } catch (e) {
      const msg = e?.message ?? 'Сүлжээний алдаа гарлаа';
      setError(msg);
      return { success: false, message: msg, data: null };
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { loading, error, execute };
};

export default useApi;
