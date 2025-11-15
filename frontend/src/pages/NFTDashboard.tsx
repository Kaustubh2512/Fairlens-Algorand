import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Image, 
  Search, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  XCircle,
  Filter,
  Wallet
} from 'lucide-react';
import { getWalletBalance } from '../api/blockchainApi';
import { WalletBalance, AssetBalance } from '../types';
import { toast } from 'sonner';

const NFTDashboard: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [assets, setAssets] = useState<AssetBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'nft' | 'other'>('all');

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const balance = await getWalletBalance();
        setWalletBalance(balance);
        setAssets(balance.assets || []);
      } catch (error) {
        toast.error('Failed to fetch wallet data');
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.asset_id.toString().includes(searchTerm);
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'nft' && asset.name?.includes('NFT')) ||
                         (filter === 'other' && !asset.name?.includes('NFT'));
    
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number, decimals: number = 6) => {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
            <p className="text-muted-foreground">
              View your wallet balance and assets
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 px-3 py-2 rounded-lg flex items-center">
                <Wallet className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Balance: {walletBalance?.algo_balance ? formatCurrency(walletBalance.algo_balance, 6) : '0'} ALGO
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assets by name or ID..."
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
              variant={filter === 'nft' ? 'default' : 'outline'} 
              onClick={() => setFilter('nft')}
            >
              NFTs
            </Button>
            <Button 
              variant={filter === 'other' ? 'default' : 'outline'} 
              onClick={() => setFilter('other')}
            >
              Other Assets
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="mr-2 h-5 w-5" />
                Wallet Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm bg-gray-100 p-3 rounded-lg break-all">
                {walletBalance?.address || 'Not connected'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="mr-2 h-5 w-5" />
                Total Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{assets.length}</div>
              <p className="text-muted-foreground">Assets in your wallet</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                NFTs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {assets.filter(asset => asset.name?.includes('NFT')).length}
              </div>
              <p className="text-muted-foreground">NFTs in your wallet</p>
            </CardContent>
          </Card>
        </div>

        {filteredAssets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Image className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">No assets found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'No assets available in your wallet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <Card key={asset.asset_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">
                      {asset.name || `Asset #${asset.asset_id}`}
                    </CardTitle>
                    {asset.name?.includes('NFT') ? (
                      <Badge variant="default">NFT</Badge>
                    ) : (
                      <Badge variant="secondary">Asset</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image className="h-16 w-16 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Asset ID</span>
                      <span className="font-medium">#{asset.asset_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Balance</span>
                      <span className="font-medium">
                        {formatCurrency(asset.amount, asset.name?.includes('NFT') ? 0 : 6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <div className="flex items-center">
                        {asset.name?.includes('NFT') ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span>NFT</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-blue-500 mr-1" />
                            <span>Asset</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button asChild variant="outline" className="w-full">
                      <a 
                        href={`https://testnet.algoexplorer.io/asset/${asset.asset_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Explorer
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>How Assets Work in FairLens</CardTitle>
              <CardDescription>
                Understanding your wallet assets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium mb-2">ALGO Balance</div>
                  <p className="text-sm text-muted-foreground">
                    Your ALGO balance is used to pay for transaction fees on the Algorand network.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-medium mb-2">NFTs</div>
                  <p className="text-sm text-muted-foreground">
                    NFTs represent milestone completions and serve as immutable proof of work.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="font-medium mb-2">Other Assets</div>
                  <p className="text-sm text-muted-foreground">
                    Other Algorand Standard Assets (ASAs) that may be used in the platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NFTDashboard;