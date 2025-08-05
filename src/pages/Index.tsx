import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, TrendingUp, BarChart3, Users, Award, ArrowRight, CheckCircle, Target, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">DealerInsight Pro</h1>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              AI-Powered Analytics
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Optimize Your Dealership's<br />
            <span className="text-blue-600">Performance & Profitability</span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Comprehensive AI-powered assessment that analyzes your dealership operations, 
            identifies growth opportunities, and provides actionable insights to boost performance across all departments.
          </p>
          
          <Link to="/assessment">
            <Button size="lg" className="h-14 px-8 text-lg font-semibold hover-scale">
              Start Your Assessment <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-3">50+</div>
                <div className="text-blue-800 font-medium">Comprehensive Questions</div>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-3">5</div>
                <div className="text-emerald-800 font-medium">Key Performance Areas</div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-3">AI</div>
                <div className="text-purple-800 font-medium">Powered Insights</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Is Your Dealership Leaving Money on the Table?
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Most dealerships struggle with fragmented processes, inconsistent performance metrics, 
              and lack of actionable insights. Without a comprehensive view of your operations, 
              it's impossible to identify the opportunities that could dramatically improve your bottom line.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              How It Works: Simple, Fast, Effective
            </h2>
            <p className="text-xl text-slate-600">
              Get actionable insights in three straightforward steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Complete Assessment</h3>
              <p className="text-slate-600">
                Answer 50+ targeted questions about your dealership operations, 
                covering sales, service, inventory, and customer experience.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">AI Analysis</h3>
              <p className="text-slate-600">
                Our AI engine analyzes your responses against industry benchmarks 
                and identifies specific areas for improvement.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Get Actionable Insights</h3>
              <p className="text-slate-600">
                Receive a comprehensive report with prioritized recommendations 
                and implementation strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Powerful Features for Maximum Impact
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Performance Benchmarking</h3>
                  <p className="text-slate-600">
                    Compare your dealership against industry standards and top performers in your region.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Department Analysis</h3>
                  <p className="text-slate-600">
                    Deep dive into sales, service, parts, and F&I departments with specific recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">AI-Powered Recommendations</h3>
                  <p className="text-slate-600">
                    Get prioritized action items with clear implementation strategies and expected ROI.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Interactive Dashboard</h3>
                  <p className="text-slate-600">
                    Visualize your performance with charts, graphs, and detailed analytics.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Secure & Confidential</h3>
                  <p className="text-slate-600">
                    Your data is protected with enterprise-grade security and remains completely confidential.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Comprehensive Reports</h3>
                  <p className="text-slate-600">
                    Export detailed reports for management presentations and team discussions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Unlock Your Dealership's Potential?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your comprehensive assessment now and discover the opportunities waiting in your business.
          </p>
          <Link to="/assessment">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold hover-scale">
              Begin Assessment <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
