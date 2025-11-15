import apiClient from './apiClient';

export interface NFT {
  id: number;
  contract_id: number;
  asset_id: number;
  name: string;
  unit_name: string;
  metadata_url: string;
  status: 'minted' | 'transferred' | 'burned';
  created_at: string;
}

export interface MintNFTData {
  contract_id: number;
  milestone_id?: number;
  name: string;
  unit_name: string;
  description: string;
  image_url?: string;
}

export const nftService = {
  // Mint a new NFT for a contract or milestone
  async mintNFT(data: MintNFTData): Promise<NFT> {
    const response = await apiClient.post('/nft/mint', data);
    return response.data;
  },

  // Get NFT by ID
  async getNFT(id: number): Promise<NFT> {
    const response = await apiClient.get(`/nft/${id}`);
    return response.data;
  },

  // Get NFT by asset ID
  async getNFTByAssetId(assetId: number): Promise<NFT> {
    const response = await apiClient.get(`/nft/asset/${assetId}`);
    return response.data;
  },

  // Transfer NFT to contractor
  async transferNFT(nftId: number, receiverAddress: string): Promise<NFT> {
    const response = await apiClient.post(`/nft/${nftId}/transfer`, { receiver_address: receiverAddress });
    return response.data;
  },

  // Burn NFT after payment release
  async burnNFT(nftId: number): Promise<NFT> {
    const response = await apiClient.post(`/nft/${nftId}/burn`);
    return response.data;
  },

  // Get NFT info from blockchain
  async getNFTInfo(assetId: number): Promise<any> {
    const response = await apiClient.get(`/nft/info/${assetId}`);
    return response.data;
  }
};