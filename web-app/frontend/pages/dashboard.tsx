import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CategoryBarChart, MonthlyTrendsChart, ScatterPlotChart, VennDiagramChart } from '../components/PlotChart';
import { Search, TrendingUp, DollarSign, BookOpen, Users, Home as HomeIcon, Car, Utensils, ArrowLeft } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  merchant: string;
  transaction_type: string; // Add transaction_type to the interface
  tags: string[]; // Add tags array
}

interface ExpenseSummary {
  total_amount: number;
  transaction_count: number;
  average_amount: number;
  category_breakdown: Record<string, number>;
  monthly_trends: Array<{ 
    month: string; 
    net?: number; 
    regular?: number; 
    income?: number;
    transaction_count?: number;
  }>;
}

// Dynamic icon and color generation functions
const getIconForCategory = (category: string) => {
  // Map categories to appropriate icons based on keywords
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('car') || lowerCategory.includes('transport')) return Car;
  if (lowerCategory.includes('food') || lowerCategory.includes('restaurant') || lowerCategory.includes('coffee') || lowerCategory.includes('groceries')) return Utensils;
  if (lowerCategory.includes('home') || lowerCategory.includes('rent') || lowerCategory.includes('utilities')) return HomeIcon;
  if (lowerCategory.includes('loan') || lowerCategory.includes('tuition')) return DollarSign;
  if (lowerCategory.includes('education') || lowerCategory.includes('upskilling') || lowerCategory.includes('kellogg')) return BookOpen;
  if (lowerCategory.includes('nightlife') || lowerCategory.includes('entertainment')) return Users;
  return TrendingUp; // Default icon
};

// Emoji mapping for parent categories (UI enhancement - can be hardcoded)
const getCategoryEmoji = (parentCategory: string): string => {
  const emojiMap: Record<string, string> = {
    'Food & Drink': '🍽️',
    'Car and Transportation': '🚗',
    'Shopping': '🛍️',
    'Home': '🏠',
    'Education': '📚',
    'Kellogg Expenses': '🎓',
    'Self Care': '💅',
    'Leisure': '🎯',
    'Entertainment': '🎬',
    'Travel': '✈️',
    'Healthcare': '🏥',
    'Technology': '💻',
    'Fitness': '💪',
    'Business': '💼',
    'Finance': '💰',
    'Insurance': '🛡️',
    'Subscriptions': '📱',
    'Gifts': '🎁',
    'Pets': '🐾',
    'Utilities': '⚡'
  };
  
  return emojiMap[parentCategory] || '📁'; // Default to folder if not found
};

// Function to get unique tags from expenses, excluding system tags
const getUniqueTags = (expenses: Expense[]): string[] => {
  const allTags = expenses.flatMap(expense => expense.tags || []);
  const uniqueTags = [...new Set(allTags)]
    .filter(tag => tag && tag !== 'nan' && !tag.startsWith('status:')) // Filter out system tags
    .sort();
  return uniqueTags;
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
  const [selectedTag, setSelectedTag] = useState('all');
  const [startDate, setStartDate] = useState('2023-07-01');
  const [endDate, setEndDate] = useState('2025-06-30');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiVisualizations, setAiVisualizations] = useState<any[]>([]);
  const [aiDataPoints, setAiDataPoints] = useState<any[]>([]);
  const [categories, setCategories] = useState<any>(null);

  // Debug logging
  useEffect(() => {
    console.log('Filter values:', { 
      startDate, 
      endDate, 
      selectedCategory,
      selectedTag,
      categoriesCount: categories?.categories?.length || 0 
    });
  }, [startDate, endDate, selectedCategory, selectedTag, categories]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('Starting data fetch...');
    try {
      console.log('Fetching transactions...');
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error(`Transactions API failed: ${response.status}`);
      }
      const data = await response.json();
      console.log('Transactions loaded:', data.length);
      setExpenses(data);
      
      console.log('Fetching summary...');
      const summaryResponse = await fetch('/api/transactions/summary');
      if (!summaryResponse.ok) {
        throw new Error(`Summary API failed: ${summaryResponse.status}`);
      }
      const summaryData = await summaryResponse.json();
      console.log('Summary loaded:', summaryData);
      // Map backend field names to frontend expected names
      setSummary({
        total_amount: summaryData.total_regular_amount || 0,
        transaction_count: summaryData.transaction_count || 0,
        average_amount: summaryData.average_amount || 0,
        category_breakdown: summaryData.category_breakdown || {},
        monthly_trends: summaryData.monthly_trends || []
      });

      console.log('Fetching categories...');
      // Fetch dynamic categories
      const categoriesResponse = await fetch('/api/categories');
      if (!categoriesResponse.ok) {
        throw new Error(`Categories API failed: ${categoriesResponse.status}`);
      }
      const categoriesData = await categoriesResponse.json();
      console.log('Categories loaded:', categoriesData.categories?.length);
      setCategories(categoriesData);
      
      console.log('All data loaded successfully!');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    
    try {
      const response = await fetch('/api/query', {
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
    
    // Enhanced category matching to handle parent categories
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      if (selectedCategory.startsWith('parent:')) {
        // Filter by parent category - check if expense's category belongs to this parent
        const parentCategory = selectedCategory.replace('parent:', '');
        if (categories && categories.hierarchy && categories.hierarchy[parentCategory]) {
          const childCategories = Object.keys(categories.hierarchy[parentCategory]);
          matchesCategory = childCategories.includes(expense.category);
        } else {
          matchesCategory = false;
        }
      } else {
        // Filter by specific child category
        matchesCategory = expense.category === selectedCategory;
      }
    }
    
    // Tag filtering
    const matchesTag = selectedTag === 'all' || 
                      (expense.tags && expense.tags.some(tag => tag === selectedTag));
    
    // Date filtering
    const expenseDate = new Date(expense.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const matchesDateRange = expenseDate >= start && expenseDate <= end;
    
    return matchesSearch && matchesCategory && matchesTag && matchesDateRange;
  });

  // Calculate filtered summary data
  const filteredSummary = {
    total_amount: filteredExpenses
      .filter(expense => expense.amount > 0 && expense.transaction_type === 'regular') // Only regular expenses, not internal transfers
      .reduce((sum, expense) => sum + expense.amount, 0),
    transaction_count: filteredExpenses.length,
    average_amount: filteredExpenses.length > 0 ? filteredExpenses
      .filter(expense => expense.amount > 0 && expense.transaction_type === 'regular')
      .reduce((sum, expense) => sum + expense.amount, 0) / filteredExpenses.filter(expense => expense.amount > 0 && expense.transaction_type === 'regular').length : 0,
    category_breakdown: filteredExpenses
      .filter(expense => expense.amount > 0 && expense.transaction_type === 'regular') // Only regular expenses in category breakdown
      .reduce((acc, expense) => {
        const category = expense.category;
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>),
    monthly_trends: [] // We'll calculate this below
  };

  // Calculate monthly trends from filtered data
  const monthlyTrends = filteredExpenses
    .filter(expense => expense.amount > 0 && expense.transaction_type === 'regular') // Only regular expenses
    .reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          net: 0,
          regular: 0,
          transaction_count: 0
        };
      }
      
      const amount = expense.amount; // No need for Math.abs since we're only including positive amounts
      acc[monthKey].net += amount;
      acc[monthKey].regular += amount;
      acc[monthKey].transaction_count += 1;
      
      return acc;
    }, {} as Record<string, any>);

  const sortedMonthlyTrends = Object.values(monthlyTrends).sort((a: any, b: any) => {
    return new Date(a.month + ' 1').getTime() - new Date(b.month + ' 1').getTime();
  });

  const categoryData = Object.entries(filteredSummary.category_breakdown).map(([category, amount], index) => ({
    name: category,
    value: amount,
    color: generateColorForCategory(category, index)
  }));

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
              <div className="flex items-center">
                <Link href="/intro" className="mr-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">MBA Expense Explorer</h1>
                  <p className="mt-1 text-sm text-gray-500">Kellogg MBA expenses from March 2023 - June 2025</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Filters Section - Moved to top */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              {(searchQuery || selectedCategory !== 'all' || selectedTag !== 'all' || startDate !== '2023-07-01' || endDate !== '2025-06-30') && (
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Filters Active: Showing {filteredExpenses.length} of {expenses.length} transactions
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  disabled={!categories || !categories.categories}
                >
                  <option value="all">All Categories</option>
                  
                  {/* Show hierarchical structure */}
                  {categories && categories.hierarchy ? (
                    Object.entries(categories.hierarchy).map(([parentCategory, childCategories]: [string, any]) => (
                      <optgroup key={parentCategory} label={`${getCategoryEmoji(parentCategory)} ${parentCategory}`}>
                        {/* Option to filter by parent category */}
                        <option key={`parent-${parentCategory}`} value={`parent:${parentCategory}`}>
                          All {parentCategory} ({Object.values(childCategories).reduce((sum: number, count: any) => sum + count, 0)})
                        </option>
                        {/* Individual child categories */}
                        {Object.entries(childCategories).map(([childCategory, count]: [string, any]) => (
                          <option key={childCategory} value={childCategory}>
                            &nbsp;&nbsp;├─ {childCategory} ({count})
                          </option>
                        ))}
                      </optgroup>
                    ))
                  ) : categories && categories.categories ? (
                    // Fallback to flat list if hierarchy isn't available
                    categories.categories.map((category: string) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading categories...</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="all">All Tags</option>
                  {getUniqueTags(expenses).map((tag) => (
                    <option key={tag} value={tag}>
                      🏷️ {tag}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Cards */}
          {filteredExpenses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Spent</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${filteredSummary.total_amount.toLocaleString()}
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
                      {filteredSummary.transaction_count}
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
                      ${filteredSummary.average_amount.toFixed(2)}
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
                      {Object.keys(filteredSummary.category_breakdown).length}
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
            {sortedMonthlyTrends.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trends</h3>
                <MonthlyTrendsChart data={sortedMonthlyTrends} />
              </div>
            )}
          </div>

          {/* Advanced Visualizations */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Patterns</h3>
            {filteredExpenses.length > 0 ? (
              <ScatterPlotChart data={filteredExpenses.slice(0, 500)} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No transaction data available for selected filters
              </div>
            )}
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
