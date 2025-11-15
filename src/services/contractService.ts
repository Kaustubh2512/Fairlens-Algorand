import apiClient from './apiClient';
import { Transaction } from 'algosdk';

export interface Contract {
  id: number;
  tender_id: number;
  contractor_id: number;
  gov_id: number;
  app_id?: number;
  app_address?: string;
  nft_id?: number;
  status: 'active' | 'completed' | 'terminated' | 'suspended';
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: number;
  contract_id: number;
  index: number;
  title: string;
  description?: string;
  amount: number;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'verified' | 'paid';
  proof_hash?: string;
  completed_at?: string;
  verified_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DeployContractData {
  tender_id: number;
  contractor_id: number;
  total_amount: number;
  milestones: {
    title: string;
    description?: string;
    amount: number;
    deadline: string;
  }[];
}

export interface VerifyMilestoneData {
  milestone_id: number;
  signature: string; // Base64 encoded signature
  message: string;   // Verification message
  proof_hash?: string;
}

export interface ReleasePaymentData {
  milestone_id: number;
}

export const contractService = {
  // Get contract by ID
  async getContract(id: number): Promise<Contract> {
    const response = await apiClient.get(`/contracts/${id}`);
    return response.data;
  },

  // Get contracts for current user
  async getMyContracts(): Promise<Contract[]> {
    const response = await apiClient.get('/contracts/my-contracts');
    return response.data;
  },

  // Deploy smart contract on Algorand
  async deployContract(data: DeployContractData): Promise<Contract> {
    const response = await apiClient.post('/contracts/deploy', data);
    return response.data;
  },

  // Get contract milestones
  async getMilestones(contractId: number): Promise<Milestone[]> {
    const response = await apiClient.get(`/contracts/${contractId}/milestones`);
    return response.data;
  },

  // Add milestone to contract
  async addMilestone(contractId: number, milestone: Omit<Milestone, 'id' | 'contract_id' | 'created_at' | 'updated_at'>): Promise<Milestone> {
    const response = await apiClient.post(`/contracts/${contractId}/milestones`, milestone);
    return response.data;
  },

  // Submit milestone proof (contractor)
  async submitMilestoneProof(milestoneId: number, proofHash: string): Promise<Milestone> {
    const response = await apiClient.post(`/milestones/${milestoneId}/submit-proof`, { proof_hash: proofHash });
    return response.data;
  },

  // Verify milestone (government/verifier)
  async verifyMilestone(data: VerifyMilestoneData): Promise<Milestone> {
    const response = await apiClient.post('/milestones/verify', data);
    return response.data;
  },

  // Release payment for milestone
  async releasePayment(data: ReleasePaymentData): Promise<Milestone> {
    const response = await apiClient.post('/milestones/release-payment', data);
    return response.data;
  },

  // Get contract transactions
  async getContractTransactions(contractId: number): Promise<any[]> {
    const response = await apiClient.get(`/contracts/${contractId}/transactions`);
    return response.data;
  }
};