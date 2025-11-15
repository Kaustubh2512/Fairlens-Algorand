import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  Building2, 
  HardHat, 
  Users, 
  TrendingUp, 
  Wallet, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Search
} from 'lucide-react';
import { createTender, listTenders } from '../api/tenderApi';
import { listContracts } from '../api/contractApi';
import { TenderCreateData } from '../api/tenderApi';
import { Tender, Contract } from '../types';
import { toast } from 'sonner';
import DashboardCard from '../components/DashboardCard';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tenders' | 'contracts' | 'create'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tendersLoading, setTendersLoading] = useState(true);
  const [contractsLoading, setContractsLoading] = useState(true);
  
  // Tender creation form state
  const [tenderData, setTenderData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    budget: '',
    deadline: '',
    start_date: '',
    duration_months: ''
  });

  useEffect(() => {
    if (activeTab === 'tenders') {
      fetchTenders();
    }
    
    if (activeTab === 'contracts') {
      fetchContracts();
    }
  }, [activeTab]);

  const fetchTenders = async () => {
    setTendersLoading(true);
    try {
      const tenderData = await listTenders();
      setTenders(tenderData);
    } catch (error) {
      toast.error('Failed to fetch tenders');
      console.error('Error fetching tenders:', error);
    } finally {
      setTendersLoading(false);
    }
  };

  const fetchContracts = async () => {
    setContractsLoading(true);
    try {
      const contractData = await listContracts();
      setContracts(contractData);
    } catch (error) {
      toast.error('Failed to fetch contracts');
      console.error('Error fetching contracts:', error);
    } finally {
      setContractsLoading(false);
    }
  };

  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const tenderCreateData: TenderCreateData = {
        title: tenderData.title,
        description: tenderData.description,
        location: tenderData.location,
        category: tenderData.category,
        budget: parseFloat(tenderData.budget),
        deadline: tenderData.deadline,
        start_date: tenderData.start_date,
        duration_months: parseInt(tenderData.duration_months)
      };
      
      await createTender(tenderCreateData);
      toast.success('Tender created successfully!');
      
      // Reset form
      setTenderData({
        title: '',
        description: '',
        location: '',
        category: '',
        budget: '',
        deadline: '',
        start_date: '',
        duration_months: ''
      });
      
      // Refresh tenders list
      fetchTenders();
      
      // Switch to tenders tab
      setActiveTab('tenders');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create tender');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTenderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Active
        </span>;
      case 'closed':
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
          Closed
        </span>;
      case 'review':
        return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          Review
        </span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {status}
        </span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage tenders, contracts, and platform settings
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => setActiveTab('create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Tender
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 border-b">
          <button
            className={`pb-2 px-1 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`pb-2 px-1 ${activeTab === 'tenders' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('tenders')}
          >
            Tenders
          </button>
          <button
            className={`pb-2 px-1 ${activeTab === 'contracts' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('contracts')}
          >
            Contracts
          </button>
          <button
            className={`pb-2 px-1 ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('create')}
          >
            Create Tender
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard 
                title="Active Tenders" 
                value={tenders.filter(t => t.status.toLowerCase() === 'active').length} 
                description="Currently open for applications" 
                icon={<FileText className="h-4 w-4 text-muted-foreground" />} 
              />
              <DashboardCard 
                title="Ongoing Projects" 
                value={contracts.filter(c => c.status.toLowerCase() === 'active').length} 
                description="Currently in progress" 
                icon={<Building2 className="h-4 w-4 text-muted-foreground" />} 
              />
              <DashboardCard 
                title="Pending Verifications" 
                value="3" 
                description="Require attention" 
                icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />} 
              />
              <DashboardCard 
                title="Total Budget" 
                value={formatCurrency(tenders.reduce((sum, tender) => sum + tender.budget, 0))} 
                description="Allocated this quarter" 
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tenders</CardTitle>
                  <CardDescription>Latest tenders created</CardDescription>
                </CardHeader>
                <CardContent>
                  {tenders.slice(0, 5).map(tender => (
                    <div key={tender.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{tender.title}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(tender.budget)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{formatDate(tender.created_at)}</p>
                        {getStatusBadge(tender.status)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Contracts</CardTitle>
                  <CardDescription>Latest contracts awarded</CardDescription>
                </CardHeader>
                <CardContent>
                  {contracts.slice(0, 5).map(contract => (
                    <div key={contract.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">Contract #{contract.id}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(contract.total_amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{formatDate(contract.created_at)}</p>
                        {contract.status.toLowerCase() === 'active' ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                            {contract.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tenders Tab */}
        {activeTab === 'tenders' && (
          <div>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tenders..."
                  className="pl-10"
                />
              </div>
            </div>
            
            {tendersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenders.map((tender) => (
                  <Card key={tender.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{tender.title}</CardTitle>
                        {getStatusBadge(tender.status)}
                      </div>
                      <CardDescription className="line-clamp-2">{tender.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>{tender.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Deadline: {formatDate(tender.deadline)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span>Budget: {formatCurrency(tender.budget)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{tender.applications_count || 0} applications</span>
                      </div>
                      <div className="pt-4">
                        <Button asChild className="w-full">
                          <Link to={`/tenders/${tender.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <div>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search contracts..."
                  className="pl-10"
                />
              </div>
            </div>
            
            {contractsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contracts.map((contract) => (
                  <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Contract #{contract.id}</CardTitle>
                        {contract.status.toLowerCase() === 'active' ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            {contract.status}
                          </span>
                        )}
                      </div>
                      <CardDescription>
                        Total Amount: {formatCurrency(contract.total_amount)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <HardHat className="mr-2 h-4 w-4" />
                        <span>Start Date: {formatDate(contract.created_at)}</span>
                      </div>
                      {contract.app_id && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>App ID: {contract.app_id}</span>
                        </div>
                      )}
                      <div className="pt-4">
                        <Button asChild className="w-full">
                          <Link to={`/contracts/${contract.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Tender Tab */}
        {activeTab === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Tender</CardTitle>
              <CardDescription>
                Fill in the details to create a new construction tender
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTender} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tender Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Road Construction Project"
                      value={tenderData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      placeholder="e.g., Road Construction"
                      value={tenderData.category}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., Bangalore, Karnataka"
                      value={tenderData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (₹)</Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      placeholder="e.g., 2500000"
                      value={tenderData.budget}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={tenderData.start_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={tenderData.deadline}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration_months">Duration (Months)</Label>
                    <Input
                      id="duration_months"
                      name="duration_months"
                      type="number"
                      placeholder="e.g., 6"
                      value={tenderData.duration_months}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Detailed description of the tender requirements..."
                    value={tenderData.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Tender'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;