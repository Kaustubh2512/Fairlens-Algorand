import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Building2, 
  HardHat, 
  Users, 
  TrendingUp, 
  Search, 
  MapPin,
  Calendar,
  IndianRupee,
  ExternalLink,
  Filter
} from 'lucide-react';
import ContractStatusChart from '../components/ContractStatusChart';
import { listTenders } from '../api/tenderApi';
import { Tender } from '../types';
import { toast } from 'sonner';

const Transparency: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [projects, setProjects] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const tenderData = await listTenders();
        setProjects(tenderData);
      } catch (error) {
        toast.error('Failed to fetch projects');
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || project.status.toLowerCase() === filter;
    
    return matchesSearch && matchesFilter;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Public Transparency Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Monitor public construction projects, verify spending, and ensure accountability 
            through our blockchain-based transparency platform.
          </p>
        </div>

        <div className="mb-8">
          <ContractStatusChart />
        </div>

        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects by title, location, or description..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilter('all')}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              All
            </Button>
            <Button 
              variant={filter === 'active' ? 'default' : 'outline'} 
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button 
              variant={filter === 'closed' ? 'default' : 'outline'} 
              onClick={() => setFilter('closed')}
            >
              Closed
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{projects.length}</div>
              <p className="text-muted-foreground">Projects funded this year</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IndianRupee className="mr-2 h-5 w-5" />
                Total Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(projects.reduce((sum, project) => sum + project.budget, 0))}
              </div>
              <p className="text-muted-foreground">Allocated this year</p>
            </CardContent>
          </Card>
        </div>

        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'No projects available at the moment'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <CardTitle className="text-xl mr-3">{project.title}</CardTitle>
                        {getStatusBadge(project.status)}
                      </div>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                    {project.blockchain_hash && (
                      <Button asChild variant="outline">
                        <a 
                          href={`https://testnet.algoexplorer.io/tx/${project.blockchain_hash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Blockchain
                        </a>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Location:</span> {project.location}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Start Date:</span> {formatDate(project.start_date)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Deadline:</span> {formatDate(project.deadline)}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-sm">
                        <IndianRupee className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Budget:</span> {formatCurrency(project.budget)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <HardHat className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Duration:</span> {project.duration_months} months</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Applications:</span> {project.applications_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">How Transparency Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">Immutable Records</h3>
              <p className="text-muted-foreground text-sm">
                All project data and transactions are recorded on the Algorand blockchain for permanent, tamper-proof storage.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">Public Access</h3>
              <p className="text-muted-foreground text-sm">
                Citizens can view project details, spending, and progress in real-time without needing an account.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground text-sm">
                Project progress, milestone completions, and payments are updated in real-time on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transparency;