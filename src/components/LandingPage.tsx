import { motion } from 'motion/react';
import { Building2, HardHat, Users, Shield, TrendingUp, Globe, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useEffect, useState } from 'react';
import GovernmentLogin from './auth/GovernmentLogin';
import ContractorLogin from './auth/ContractorLogin';
import CitizenAccess from './auth/CitizenAccess';

interface LandingPageProps {
  onRoleSelect: (role: 'government' | 'contractor' | 'citizen') => void;
}

export default function LandingPage({ onRoleSelect }: LandingPageProps) {
  const [governmentLoginOpen, setGovernmentLoginOpen] = useState(false);
  const [contractorLoginOpen, setContractorLoginOpen] = useState(false);
  const [citizenAccessOpen, setCitizenAccessOpen] = useState(false);
  const [activeTenders, setActiveTenders] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [verifications, setVerifications] = useState(0);

  useEffect(() => {
    // Animated counters
    const tenderInterval = setInterval(() => {
      setActiveTenders(prev => prev < 245 ? prev + 5 : 245);
    }, 30);

    const budgetInterval = setInterval(() => {
      setTotalBudget(prev => prev < 1245 ? prev + 25 : 1245);
    }, 30);

    const verifyInterval = setInterval(() => {
      setVerifications(prev => prev < 3456 ? prev + 70 : 3456);
    }, 30);

    return () => {
      clearInterval(tenderInterval);
      clearInterval(budgetInterval);
      clearInterval(verifyInterval);
    };
  }, []);

  const roleCards = [
    {
      role: 'government' as const,
      title: 'Government',
      description: 'Manage tenders, monitor projects, and ensure transparency',
      icon: Building2,
      color: 'from-blue-600 to-blue-800',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'Create & Manage Tenders',
        'AI-Powered Risk Analysis',
        'Real-time Project Monitoring',
        'Blockchain Verification'
      ]
    },
    {
      role: 'contractor' as const,
      title: 'Contractor',
      description: 'Bid on projects, track progress, and manage deliverables',
      icon: HardHat,
      color: 'from-emerald-600 to-emerald-800',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      features: [
        'Smart Tender Discovery',
        'Bid Management',
        'Progress Tracking',
        'Automated Payments'
      ]
    },
    {
      role: 'citizen' as const,
      title: 'Citizen',
      description: 'Monitor public spending and report issues transparently',
      icon: Users,
      color: 'from-purple-600 to-purple-800',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        'Track Local Projects',
        'Spending Analytics',
        'Report Issues',
        'Community Engagement'
      ]
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Analysis',
      description: 'Smart predictions for corruption risks, delays, and cost overruns'
    },
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Immutable records and transparent audit trails for all transactions'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboards with live project and budget tracking'
    },
    {
      icon: Globe,
      title: 'Public Transparency',
      description: 'Open access to project data, budgets, and progress for all citizens'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.h1
              className="mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <span className="block text-6xl mb-2">FAIRLENS</span>
              <span className="block text-3xl opacity-90">Building Trust in Construction</span>
            </motion.h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Transforming public infrastructure projects with AI, Blockchain, and complete transparency. 
              Zero tolerance for corruption.
            </p>

            {/* Animated Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <div className="text-4xl mb-2">{activeTenders}</div>
                <div className="text-sm opacity-90">Active Tenders</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <div className="text-4xl mb-2">₹{totalBudget}Cr</div>
                <div className="text-sm opacity-90">Total Budget</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <div className="text-4xl mb-2">{verifications}</div>
                <div className="text-sm opacity-90">Blockchain Verifications</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Role Selection Cards */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl mb-4">Select Your Role</h2>
          <p className="text-xl text-gray-600">Choose how you want to interact with FAIRLENS</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roleCards.map((card, index) => (
            <motion.div
              key={card.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Card className={`${card.borderColor} border-2 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}>
                <CardHeader className={`${card.bgColor} rounded-t-lg`}>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 mx-auto`}>
                    <card.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-center">{card.title}</CardTitle>
                  <CardDescription className="text-center">{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-6">
                    {card.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => {
                      if (card.role === 'government') setGovernmentLoginOpen(true);
                      else if (card.role === 'contractor') setContractorLoginOpen(true);
                      else setCitizenAccessOpen(true);
                    }}
                    className={`w-full bg-gradient-to-r ${card.color} hover:opacity-90`}
                  >
                    {card.role === 'citizen' ? 'Access as Citizen' : `Login as ${card.title}`}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl text-center mb-12">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="opacity-80">
            © 2025 FAIRLENS - Transparent Construction Management Platform
          </p>
          <p className="text-sm opacity-60 mt-2">
            Powered by AI, Blockchain & Smart Contracts
          </p>
        </div>
      </div>

      {/* Authentication Modals */}
      <GovernmentLogin 
        isOpen={governmentLoginOpen}
        onClose={() => setGovernmentLoginOpen(false)}
        onSuccess={() => onRoleSelect('government')}
      />
      <ContractorLogin 
        isOpen={contractorLoginOpen}
        onClose={() => setContractorLoginOpen(false)}
        onSuccess={() => onRoleSelect('contractor')}
      />
      <CitizenAccess 
        isOpen={citizenAccessOpen}
        onClose={() => setCitizenAccessOpen(false)}
        onPublicAccess={() => onRoleSelect('citizen')}
        onRegisteredAccess={() => onRoleSelect('citizen')}
      />
    </div>
  );
}
