import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowRight, 
  BarChart3, 
  Brain, 
  DollarSign, 
  Eye, 
  GraduationCap, 
  Lightbulb, 
  PieChart, 
  Search, 
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

interface StatsData {
  transaction_count: number;
  category_count: number;
  date_range: {
    start: string;
    end: string;
    years: number;
  };
}

export default function Intro() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch summary data for transaction count
      const summaryResponse = await fetch('/api/transactions/summary');
      const summaryData = await summaryResponse.json();
      
      // Fetch categories data for category count
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = await categoriesResponse.json();
      
      // Fetch transactions to calculate date range
      const transactionsResponse = await fetch('/api/transactions');
      const transactionsData = await transactionsResponse.json();
      
      // Calculate date range
      const dates = transactionsData.map((t: any) => new Date(t.date));
      const startDate = new Date(Math.min(...dates.map((d: Date) => d.getTime())));
      const endDate = new Date(Math.max(...dates.map((d: Date) => d.getTime())));
      const yearsDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25) * 10) / 10;

      setStats({
        transaction_count: summaryData.transaction_count || 0,
        category_count: categoriesData.categories?.length || 0,
        date_range: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          years: yearsDiff
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to default values if API fails
      setStats({
        transaction_count: 6030,
        category_count: 22,
        date_range: {
          start: '2023-08-01',
          end: '2025-08-01',
          years: 2.0
        }
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Head>
        <title>Wellthy - MBA Expense Intelligence</title>
        <meta name="description" content="AI-powered expense analysis for MBA students - Discover spending patterns, optimize budgets, and make data-driven financial decisions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              {/* Logo/Brand */}
              <div className="flex justify-center items-center mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Wellthy
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">MBA Expense Intelligence</p>
                </div>
              </div>


              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Explore real expense data from a Kellogg MBA student's 2-year journey, 
                including pre-program costs from deposit through graduation.
              </p>

              {/* CTA Button */}
              <Link href="/dashboard" className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg shadow hover:bg-blue-700 transition-colors group">
                View Expense Data
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {loading ? '...' : stats?.transaction_count.toLocaleString()}
                  </div>
                  <div className="text-gray-600 mt-1">Real Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {loading ? '...' : stats?.category_count}
                  </div>
                  <div className="text-gray-600 mt-1">Expense Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    2+ Years
                  </div>
                  <div className="text-gray-600 mt-1">MBA Program Data</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Story Section */}
        <div className="py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              About This Data
            </h3>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <p className="text-lg text-gray-700 mb-4">
                This dataset represents the complete financial journey of a Kellogg MBA student from 
                <span className="font-semibold text-blue-600"> March 2023 to June 2025</span>.
              </p>
              <p className="text-gray-600 mb-4">
                The data begins with the initial program deposit in late March 2023 and continues through 
                graduation in June 2025, capturing both pre-program preparation costs and the full 
                two-year academic experience.
              </p>
              <p className="text-gray-600">
                Every transaction has been categorized to provide insights into the true cost structure 
                of pursuing an MBA at a top-tier business school.
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Common Research Questions
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore questions prospective MBA students might want to understand about program costs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Use Case 1 */}
              <div className="bg-gray-50 p-8 rounded-lg border">
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Total Cost Planning</h4>
                <p className="text-gray-600 mb-4">
                  "What's the real total cost of an MBA beyond tuition? How much should I budget for the entire program?"
                </p>
                <div className="text-sm text-gray-500">
                  See comprehensive spending across all categories over 2+ years
                </div>
              </div>

              {/* Use Case 2 */}
              <div className="bg-gray-50 p-8 rounded-lg border">
                <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Hidden Costs Discovery</h4>
                <p className="text-gray-600 mb-4">
                  "What unexpected expenses should I prepare for? How much does travel, social events, and eating out really cost?"
                </p>
                <div className="text-sm text-gray-500">
                  Discover spending categories you might not have considered
                </div>
              </div>

              {/* Use Case 3 */}
              <div className="bg-gray-50 p-8 rounded-lg border">
                <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Seasonal Cost Patterns</h4>
                <p className="text-gray-600 mb-4">
                  "When are the most expensive periods during an MBA? Should I expect higher costs at the start of each semester?"
                </p>
                <div className="text-sm text-gray-500">
                  Understand when to expect peak expenses during the program
                </div>
              </div>

              {/* Use Case 4 */}
              <div className="bg-gray-50 p-8 rounded-lg border">
                <div className="bg-orange-100 p-3 rounded-lg w-fit mb-4">
                  <Search className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Specific Cost Research</h4>
                <p className="text-gray-600 mb-4">
                  "How much should I budget for coffee and meals on campus? What about going out?"
                </p>
                <div className="text-sm text-gray-500">
                  Research specific expense categories you're curious about
                </div>
              </div>

              {/* Use Case 5 */}
              <div className="bg-gray-50 p-8 rounded-lg border">
                <div className="bg-red-100 p-3 rounded-lg w-fit mb-4">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Lifestyle Budgeting</h4>
                <p className="text-gray-600 mb-4">
                  "How much do MBA students spend on entertainment and social activities? What's a realistic budget for maintaining work-life balance?"
                </p>
                <div className="text-sm text-gray-500">
                  Plan for social and recreational expenses during your program
                </div>
              </div>

              {/* Use Case 6 */}
              <div className="bg-gray-50 p-8 rounded-lg border">
                <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
                  <GraduationCap className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Financial Planning</h4>
                <p className="text-gray-600 mb-4">
                  "How should I structure my savings before starting? What's the typical spending pattern across both years of the program?"
                </p>
                <div className="text-sm text-gray-500">
                  Understand cash flow patterns to plan your financing strategy
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Overview Section */}
        <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Data Description */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  What You'll Find
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-lg mr-4 mt-1">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Real Transaction Data</h4>
                      <p className="text-gray-600">
                        {loading ? 'Loading...' : `${stats?.transaction_count.toLocaleString()} actual transactions from a Kellogg MBA student, covering March 2023 (deposit) through June 2025 (graduation)`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-lg mr-4 mt-1">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Comprehensive Categories</h4>
                      <p className="text-gray-600">Rent, food, transportation, social activitiesand more</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4 mt-1">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Time-Series Analysis</h4>
                      <p className="text-gray-600">Track spending patterns across quarters and seasons</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Tools */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Available Analysis
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-orange-100 p-2 rounded-lg mr-4 mt-1">
                      <Search className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Search & Filter</h4>
                      <p className="text-gray-600">Find specific categories, amounts, or date ranges</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-red-100 p-2 rounded-lg mr-4 mt-1">
                      <PieChart className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Visual Breakdowns</h4>
                      <p className="text-gray-600">Charts and graphs showing spending distribution</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-4 mt-1">
                      <Brain className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Natural Language Queries</h4>
                      <p className="text-gray-600">Ask questions about the data in plain English</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How to Use the Tool
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Simple steps to explore the MBA expense data
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-bold text-gray-700">1</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Browse the Data</h4>
                <p className="text-gray-600">
                  View transaction summaries, category breakdowns, and spending trends
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-bold text-gray-700">2</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Filter & Search</h4>
                <p className="text-gray-600">
                  Use filters to focus on specific categories, time periods, or merchants
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-bold text-gray-700">3</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Ask Questions</h4>
                <p className="text-gray-600">
                  Type natural language questions to get specific insights from the data
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Explore the Data
            </h3>
            <p className="text-xl text-blue-100 mb-8">
              Start analyzing real MBA expense data to understand graduate school spending patterns
            </p>
            <Link href="/dashboard" className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-lg shadow hover:bg-gray-50 transition-colors group">
              View Expense Dashboard
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <GraduationCap className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-2xl font-bold">Wellthy</span>
              </div>
              <p className="text-gray-400 mb-4">
                MBA expense analysis tool
              </p>
              <p className="text-sm text-gray-500">
                Educational tool for understanding graduate school expenses
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
