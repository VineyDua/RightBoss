import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle2, User, BrainCircuit } from 'lucide-react';
import Button from '../components/ui/Button';
import Header from '../components/layout/Header';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400">
              Leaders Don’t Apply. They Get Matched.
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Let our AI get to know you in 10 minutes—and discover roles that recognize your unique strengths.


              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/signup">
                  <Button size="lg" gradient rightIcon={<ArrowRight className="h-5 w-5" />}>
                    Match
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How RightBoss Works</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                A revolutionary approach to hiring that puts talent first
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800 rounded-xl p-6 transition-all duration-300 hover:bg-gray-750 hover:translate-y-[-4px]">
                <div className="w-14 h-14 rounded-full bg-purple-900/50 flex items-center justify-center mb-6">
                  <Clock className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3"> 10 Minutes of You
                </h3>
                <p className="text-gray-400">
                Tired of sending resumes into a void? Give us 10 minutes. Our AI gets to know your skills, story, and leadership style—no forms, no fluff.
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 transition-all duration-300 hover:bg-gray-750 hover:translate-y-[-4px]">
                <div className="w-14 h-14 rounded-full bg-purple-900/50 flex items-center justify-center mb-6">
                  <BrainCircuit className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Leadership-First Profile</h3>
                <p className="text-gray-400">
                You're not a keyword. You're a leader. We build a smart, dynamic profile that shows your potential—not just your past job titles.
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 transition-all duration-300 hover:bg-gray-750 hover:translate-y-[-4px]">
                <div className="w-14 h-14 rounded-full bg-purple-900/50 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Matched with Top Companies</h3>
                <p className="text-gray-400">
                Forget job boards and ghosted applications. RightBoss matches you directly with companies looking for decision-makers like you.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits */}
        <section className="py-20 bg-black relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-radial from-purple-900/20 to-transparent pointer-events-none opacity-30"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Candidates Love Us</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Join thousands of professionals who've transformed their job search
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 shadow-xl">
                <h3 className="text-2xl font-semibold mb-4">Skip the Resume Theater</h3>
                <p className="text-gray-300 mb-6">
                You shouldn’t need a playbook to get noticed. Your skills and potential are enough.
                </p>
                <ul className="space-y-3">
                  {['No multiple resume uploads', 'No tailoring', 'No jargon tricks'].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 shadow-xl">
                <h3 className="text-2xl font-semibold mb-4">Always-On Visibility</h3>
                <p className="text-gray-300 mb-6">
                  Your profile remains discoverable to top companies even when you're not actively 
                  looking, creating opportunities without the constant job search.
                </p>
                <ul className="space-y-3">
                  {['Passive job discovery', 'Direct company outreach', 'Continuous opportunities'].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <Link to="/signup">
              <Button size="lg" gradient rightIcon={<ArrowRight className="h-5 w-5" />}>
                    Match
                  </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <span className="ml-2 text-white font-bold text-xl">RightBoss</span>
              </div>
              <p className="mt-2 text-sm text-gray-400 max-w-xs">
                Revolutionizing hiring with AI-driven interviews and candidate matching
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-medium mb-3">Platform</h3>
                <ul className="space-y-2">
                  {['How It Works', 'For Engineers', 'For Managers', 'For Companies'].map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-3">Company</h3>
                <ul className="space-y-2">
                  {['About Us', 'Blog', 'Careers', 'Contact'].map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-3">Legal</h3>
                <ul className="space-y-2">
                  {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 RightBoss. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;