import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { CategoryPieChart, MonthlyTrendsChart, ScatterPlotChart, CategoryBarChart, VennDiagramChart } from '../components/PlotChart';
import { Search, TrendingUp, DollarSign, BookOpen, Users, Home, Car, Utensils } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  merchant: string;
}

interface ExpenseSummary {
  total_amount: number;
  transaction_count: number;
  average_amount: number;
  category_breakdown: Record<string, number>;
  monthly_trends: Array<{ month: string; amount: number }>;
}

// Dynamic icon and color generation functions
const getIconForCategory = (category: string) => {
  // Map categories to appropriate icons based on keywords
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('car') || lowerCategory.includes('transport')) return Car;
  if (lowerCategory.includes('food') || lowerCategory.includes('restaurant') || lowerCategory.includes('coffee') || lowerCategory.includes('groceries')) return Utensils;
  if (lowerCategory.includes('home') || lowerCategory.includes('rent') || lowerCategory.includes('utilities')) return Home;
  if (lowerCategory.includes('loan') || lowerCategory.includes('tuition')) return DollarSign;
  if (lowerCategory.includes('education') || lowerCategory.includes('upskilling') || lowerCategory.includes('kellogg')) return BookOpen;
  if (lowerCategory.includes('nightlife') || lowerCategory.includes('entertainment')) return Users;
  return TrendingUp; // Default icon
};

const generateColorForCategory = (category: string, index: number) => {
  // Generate consistent colors based on category name
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#D5DBDB', '#FF9999',
    '#CCCCCC', '#FFD93D', '#6BCB77', '#FFA07A', '#20B2AA', '#87CEEB',
    '#4169E1', '#DA70D6', '#FF69B4', '#FFD700', '#FF6347', '#9370DB',
    '#32CD32', '#FF1493', '#00CED1', '#FFB6C1', '#8A2BE2', '#DC143C'
  ];
  
  // Use category name hash to get consistent color
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiVisualizations, setAiVisualizations] = useState<any[]>([]);
  const [aiDataPoints, setAiDataPoints] = useState<any[]>([]);
  const [categories, setCategories] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/transactions');
      const data = await response.json();
      setExpenses(data);
      
      const summaryResponse = await fetch('http://localhost:8000/transactions/summary');
      const summaryData = await summaryResponse.json();
      // Map backend field names to frontend expected names
      setSummary({
        total_amount: summaryData.total_regular_amount || 0,
        transaction_count: summaryData.transaction_count || 0,
        average_amount: summaryData.average_amount || 0,
        category_breakdown: summaryData.category_breakdown || {},
        monthly_trends: summaryData.monthly_trends || []
      });

      // Fetch dynamic categories
      const categoriesResponse = await fetch('http://localhost:8000/categories');
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    
    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: aiQuery }),
      });
      
      const data = await response.json();
      setAiResponse(data.answer);
      setAiVisualizations(data.visualizations || []);
      setAiDataPoints(data.data_points || []);
    } catch (error) {
      console.error('Error processing AI query:', error);
      setAiResponse('Sorry, I encountered an error processing your question.');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryData = summary ? Object.entries(summary.category_breakdown).map(([category, data], index) => ({
    name: category,
    value: typeof data === 'number' ? data : data.net || data.regular || 0,
    color: generateColorForCategory(category, index)
  })) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expense data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>MBA Expense Explorer</title>
        <meta name="description" content="Explore real MBA expense data with AI-powered insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MBA Expense Explorer</h1>
                <p className="mt-1 text-sm text-gray-500">Real expense data from an MBA student</p>
              </div>
              <div className="flex items-center space-x-4">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Spent</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${summary?.total_amount?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Transactions</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {summary?.transaction_count || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Average</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${summary?.average_amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Categories</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {summary?.category_breakdown ? Object.keys(summary.category_breakdown).length : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Query Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ask AI About Your Expenses</h2>
            <div className="flex space-x-4">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g., How much did I spend on textbooks this semester?"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAiQuery}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Ask AI
              </button>
            </div>
            {aiResponse && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-gray-700">{aiResponse}</p>
              </div>
            )}
            
            {/* Render visualizations */}
            {aiVisualizations.map((viz, index) => (
              <div key={index} className="mt-6">
                {viz.chart_type === 'tag_selector' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">{viz.title}</h3>
                    <p className="text-gray-600 mb-4">{viz.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viz.available_options?.map((option: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => {
                            setAiQuery(`Show me "${option.tag}" breakdown`);
                            handleAiQuery();
                          }}
                          className="text-left p-4 border rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <div className="font-semibold">{option.tag}</div>
                          <div className="text-sm text-gray-600">
                            ${option.total_amount.toFixed(2)} • {option.transaction_count} transactions
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {viz.chart_type === 'venn' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">{viz.title}</h3>
                    <p className="text-gray-600 mb-4">{viz.description}</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Venn-style visualization */}
                      <div>
                        <h4 className="font-medium mb-2">Category Overlap</h4>
                        <VennDiagramChart data={aiDataPoints.slice(0, 3).map((point: any) => ({
                          name: point.category,
                          value: point.amount,
                          color: generateColorForCategory(point.category, 0)
                        }))} />
                      </div>
                      {/* Data breakdown */}
                      <div>
                        <h4 className="font-medium mb-2">Breakdown</h4>
                        <div className="space-y-2">
                          {aiDataPoints.map((point: any, i: number) => (
                            <div key={i} className="flex justify-between p-3 bg-gray-50 rounded">
                              <span className="font-medium">{point.category}</span>
                              <span className="text-gray-600">
                                ${point.amount.toFixed(2)} ({point.percentage.toFixed(1)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
              {categoryData.length > 0 ? (
                <CategoryBarChart data={categoryData} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No category data available
                </div>
              )}
            </div>

            {/* Monthly Trends */}
            {summary && summary.monthly_trends.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trends</h3>
                <MonthlyTrendsChart data={summary.monthly_trends} />
              </div>
            )}
          </div>

          {/* Advanced Visualizations */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Patterns</h3>
            {expenses.length > 0 ? (
              <ScatterPlotChart data={expenses.slice(0, 500)} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No transaction data available
              </div>
            )}
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search expenses..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories && categories.categories && categories.categories.map((category: string) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Expense Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Expense Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Merchant
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => {
                    const IconComponent = getIconForCategory(expense.category);
                    const color = generateColorForCategory(expense.category, 0);
                    
                    return (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <IconComponent className="h-4 w-4 mr-2" style={{ color }} />
                            <span className="text-sm text-gray-900">
                              {expense.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${expense.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.merchant}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
