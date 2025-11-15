import apiClient from './apiClient';

export interface Tender {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  budget: number;
  deadline: string;
  start_date?: string;
  duration_months?: number;
  technical_specs?: string;
  quality_standards?: string;
  status: 'draft' | 'active' | 'review' | 'closed' | 'completed';
  gov_id: number;
  blockchain_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  tender_id: number;
  contractor_id: number;
  bid_amount: number;
  proposal_link?: string;
  technical_proposal?: string;
  timeline_months?: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CreateTenderData {
  title: string;
  description: string;
  location: string;
  category: string;
  budget: number;
  deadline: string;
  start_date?: string;
  duration_months?: number;
  technical_specs?: string;
  quality_standards?: string;
}

export interface ApplyToTenderData {
  tender_id: number;
  bid_amount: number;
  proposal_link?: string;
  technical_proposal?: string;
  timeline_months?: number;
}

export const tenderService = {
  // Get all tenders
  async getTenders(): Promise<Tender[]> {
    const response = await apiClient.get('/tenders');
    return response.data;
  },

  // Get tender by ID
  async getTender(id: number): Promise<Tender> {
    const response = await apiClient.get(`/tenders/${id}`);
    return response.data;
  },

  // Create a new tender (government only)
  async createTender(data: CreateTenderData): Promise<Tender> {
    const response = await apiClient.post('/tenders', data);
    return response.data;
  },

  // Update tender (government only)
  async updateTender(id: number, data: Partial<CreateTenderData>): Promise<Tender> {
    const response = await apiClient.put(`/tenders/${id}`, data);
    return response.data;
  },

  // Delete tender (government only)
  async deleteTender(id: number): Promise<void> {
    await apiClient.delete(`/tenders/${id}`);
  },

  // Get applications for a tender (government only)
  async getTenderApplications(tenderId: number): Promise<Application[]> {
    const response = await apiClient.get(`/tenders/${tenderId}/applications`);
    return response.data;
  },

  // Apply to a tender (contractor only)
  async applyToTender(data: ApplyToTenderData): Promise<Application> {
    const response = await apiClient.post('/tenders/apply', data);
    return response.data;
  },

  // Get my applications (contractor only)
  async getMyApplications(): Promise<Application[]> {
    const response = await apiClient.get('/tenders/my-applications');
    return response.data;
  },

  // Accept application (government only)
  async acceptApplication(applicationId: number): Promise<Application> {
    const response = await apiClient.post(`/tenders/applications/${applicationId}/accept`);
    return response.data;
  },

  // Reject application (government only)
  async rejectApplication(applicationId: number): Promise<Application> {
    const response = await apiClient.post(`/tenders/applications/${applicationId}/reject`);
    return response.data;
  }
};