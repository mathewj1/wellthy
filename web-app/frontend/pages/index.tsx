import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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

const categoryIcons = {
  tuition: BookOpen,
  books_supplies: BookOpen,
  housing: Home,
  food: Utensils,
  transportation: Car,
  networking: Users,
  entertainment: TrendingUp,
  health: TrendingUp,
  technology: TrendingUp,
  travel: TrendingUp,
  other: TrendingUp,
};

const categoryColors = {
  tuition: '#FF6B6B',
  books_supplies: '#4ECDC4',
  housing: '#45B7D1',
  food: '#96CEB4',
  transportation: '#FFEAA7',
  networking: '#DDA0DD',
  entertainment: '#98D8C8',
  health: '#F7DC6F',
  technology: '#BB8FCE',
  travel: '#85C1E9',
  other: '#D5DBDB',
};

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/expenses');
      const data = await response.json();
      setExpenses(data);
      
      const summaryResponse = await fetch('http://localhost:8000/expenses/summary');
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);
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

  const categoryData = summary ? Object.entries(summary.category_breakdown).map(([category, amount]) => ({
    name: category.replace('_', ' ').toUpperCase(),
    value: amount,
    color: categoryColors[category as keyof typeof categoryColors] || '#D5DBDB'
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
                      ${summary.total_amount.toLocaleString()}
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
                      {summary.transaction_count}
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
                      ${summary.average_amount.toFixed(2)}
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
                      {Object.keys(summary.category_breakdown).length}
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
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Trends */}
            {summary && summary.monthly_trends.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={summary.monthly_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                    <Bar dataKey="amount" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
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
                  {Object.keys(categoryColors).map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ').toUpperCase()}
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
                    const IconComponent = categoryIcons[expense.category as keyof typeof categoryIcons] || TrendingUp;
                    const color = categoryColors[expense.category as keyof typeof categoryColors] || '#D5DBDB';
                    
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
                              {expense.category.replace('_', ' ').toUpperCase()}
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
