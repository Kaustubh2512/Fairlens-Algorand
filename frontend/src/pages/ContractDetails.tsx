import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Building2, 
  HardHat, 
  Users, 
  Calendar, 
  IndianRupee, 
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { getContract, getContractMilestones } from '../api/contractApi';
import { getTender } from '../api/tenderApi';
import { Contract, Milestone, Tender } from '../types';
import { toast } from 'sonner';

const ContractDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [tender, setTender] = useState<Tender | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        // Fetch contract details
        const contractData = await getContract(parseInt(id));
        setContract(contractData);
        
        // Fetch associated tender
        const tenderData = await getTender(contractData.tender_id);
        setTender(tenderData);
        
        // Fetch milestones
        const milestoneData = await getContractMilestones(contractData.id);
        setMilestones(milestoneData);
      } catch (error) {
        toast.error('Failed to fetch contract details');
        console.error('Error fetching contract details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMilestoneStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'verified':
        return <Badge variant="default">Verified</Badge>;
      case 'paid':
        return <Badge variant="secondary">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMilestoneStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
          <p className="text-muted-foreground mb-4">The contract you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/my-contracts">Back to My Contracts</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalAmount = milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
  const paidAmount = milestones
    .filter(m => m.status.toLowerCase() === 'paid')
    .reduce((sum, milestone) => sum + milestone.amount, 0);
  const progressPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/my-contracts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Link>
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <CardTitle className="text-2xl mr-3">Contract #{contract.id}</CardTitle>
                  {getStatusBadge(contract.status)}
                </div>
                <CardDescription>
                  {tender?.title || 'Tender details not available'}
                </CardDescription>
              </div>
              {contract.app_id && (
                <div className="mt-4 md:mt-0">
                  <Button asChild variant="outline">
                    <a 
                      href={contract.explorer_url || `https://testnet.algoexplorer.io/application/${contract.app_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Smart Contract
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <HardHat className="mr-2 h-4 w-4 text-muted-foreground" />
                <span><span className="font-medium">Contractor:</span> Contractor Name</span>
              </div>
              <div className="flex items-center text-sm">
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <span><span className="font-medium">Government:</span> Government Department</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span><span className="font-medium">Start Date:</span> {formatDate(contract.created_at)}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <IndianRupee className="mr-2 h-4 w-4 text-muted-foreground" />
                <span><span className="font-medium">Total Amount:</span> {formatCurrency(contract.total_amount)}</span>
              </div>
              <div className="flex items-center text-sm">
                <IndianRupee className="mr-2 h-4 w-4 text-muted-foreground" />
                <span><span className="font-medium">Paid Amount:</span> {formatCurrency(paidAmount)}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium mr-2">Progress:</span>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">{progressPercentage}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <CardDescription>Project milestones and payment status</CardDescription>
          </CardHeader>
          <CardContent>
            {milestones.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No milestones have been created for this contract yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          {getMilestoneStatusIcon(milestone.status)}
                        </div>
                        <div>
                          <h3 className="font-medium">{milestone.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                          <div className="flex items-center text-sm mt-2">
                            <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                            <span>Due: {formatDate(milestone.due_date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(milestone.amount)}</div>
                        <div className="mt-1">
                          {getMilestoneStatusBadge(milestone.status)}
                        </div>
                      </div>
                    </div>
                    
                    {milestone.proof_hash && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center text-sm">
                          <span className="font-medium mr-2">Proof:</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {milestone.proof_hash.substring(0, 16)}...
                          </span>
                          {milestone.verified_at && (
                            <span className="ml-2 text-xs text-green-600">
                              Verified on {formatDate(milestone.verified_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {milestone.paid_at && (
                      <div className="mt-2">
                        <span className="text-xs text-green-600">
                          Paid on {formatDate(milestone.paid_at)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button asChild>
            <Link to={`/verify-milestone/${milestones.find(m => m.status.toLowerCase() === 'pending')?.id || milestones[0]?.id}`}>
              Verify Milestone
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;