import {
  AgentRecord,
  CerdAgentConfig,
  CreditProfile,
  RegisterAgentInput,
  RiskEvaluationRequest,
  RiskEvaluationResponse,
  CreateTaskInput,
} from "./types";

export class CerdAgent {
  private baseUrl: string;
  private apiKey?: string;
  private timeoutMs: number;

  constructor(config: CerdAgentConfig = {}) {
    this.baseUrl = config.baseUrl || "http://localhost:3000";
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs || 10000;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(`CerdAgent API Error (${res.status}): ${errorBody.message || res.statusText}`);
      }

      return (await res.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fetch reputation score and full breakdown for an agent
   */
  async getReputation(agentId: string): Promise<any> {
    return this.request(`/api/agents/${encodeURIComponent(agentId)}/reputation`);
  }

  /**
   * Fetch complete credit profile for an agent
   */
  async getCreditProfile(agentId: string): Promise<CreditProfile> {
    return this.request<CreditProfile>(`/api/agents/${encodeURIComponent(agentId)}/credit-profile`);
  }

  /**
   * Fetch agent identity record
   */
  async getAgent(agentId: string): Promise<AgentRecord> {
    return this.request<AgentRecord>(`/api/agents/${encodeURIComponent(agentId)}`);
  }

  /**
   * List registered agents with optional filters
   */
  async listAgents(query?: { category?: string; riskCategory?: string; creditTier?: string }): Promise<AgentRecord[]> {
    const params = new URLSearchParams();
    if (query?.category) params.append("category", query.category);
    if (query?.riskCategory) params.append("riskCategory", query.riskCategory);
    if (query?.creditTier) params.append("creditTier", query.creditTier);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return this.request<AgentRecord[]>(`/api/agents${qs}`);
  }

  /**
   * Evaluate counterparty risk for a proposed economic deal
   */
  async evaluateRisk(input: RiskEvaluationRequest): Promise<RiskEvaluationResponse> {
    return this.request<RiskEvaluationResponse>("/api/risk/evaluate", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  /**
   * Register a new agent
   */
  async registerAgent(input: RegisterAgentInput): Promise<AgentRecord> {
    return this.request<AgentRecord>("/api/agents/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  /**
   * Get transaction history for an agent
   */
  async getTransactions(agentId: string): Promise<any[]> {
    return this.request(`/api/agents/${encodeURIComponent(agentId)}/transactions`);
  }

  /**
   * Get task history for an agent
   */
  async getTasks(agentId: string): Promise<any[]> {
    return this.request(`/api/agents/${encodeURIComponent(agentId)}/tasks`);
  }

  /**
   * Get collateral staking info for an agent
   */
  async getStake(agentId: string): Promise<any> {
    return this.request(`/api/agents/${encodeURIComponent(agentId)}/stake`);
  }

  /**
   * Create an agent-to-agent task
   */
  async createTask(input: CreateTaskInput): Promise<any> {
    return this.request("/api/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  /**
   * Submit completion evidence for a task
   */
  async submitTaskEvidence(taskId: string, evidenceUri: string, description: string): Promise<any> {
    return this.request(`/api/tasks/${encodeURIComponent(taskId)}/submit`, {
      method: "POST",
      body: JSON.stringify({ evidenceUri, description }),
    });
  }

  /**
   * Verify or reject a task submission
   */
  async verifyTask(taskId: string, approved: boolean, notes: string): Promise<any> {
    return this.request(`/api/tasks/${encodeURIComponent(taskId)}/verify`, {
      method: "POST",
      body: JSON.stringify({ approved, notes }),
    });
  }

  /**
   * Raise a formal dispute
   */
  async raiseDispute(input: {
    initiatorAgentId: string;
    counterpartyAgentId: string;
    transactionId?: string;
    taskId?: string;
    reason: string;
    evidenceUri?: string;
  }): Promise<any> {
    return this.request("/api/disputes", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
}
