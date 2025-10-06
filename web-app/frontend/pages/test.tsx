import React, { useState, useEffect } from 'react';

export default function Test() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Testing API call...');
        const response = await fetch('/api/transactions');
        if (!response.ok) {
          throw new Error(`API failed: ${response.status}`);
        }
        const result = await response.json();
        console.log('API success:', result.length, 'transactions');
        setData(result);
      } catch (err) {
        console.error('API error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading test...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      <p>Successfully loaded {data?.length || 0} transactions</p>
      <div className="mt-4">
        <h2 className="text-lg font-semibold">First 3 transactions:</h2>
        <pre className="bg-gray-100 p-4 mt-2 text-sm overflow-auto">
          {JSON.stringify(data?.slice(0, 3), null, 2)}
        </pre>
      </div>
    </div>
  );
}
