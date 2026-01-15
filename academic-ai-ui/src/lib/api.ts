// Academic AI Assistant API Client
// Handles communication between frontend and backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatSession {
  id: string;
  title: string;
  subject: string;
  created_at: string;
  messages: ChatMessage[];
  artifacts: {
    study_plans: any[];
    notes: any[];
    progress: any[];
    memory: any;
  };
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tools?: string[];
  pinned?: boolean;
}

export interface ChatRequest {
  session_id: string;
  message: string;
  stream?: boolean;
}

export interface ChatResponse {
  session_id: string;
  response: string;
  timestamp: string;
  agent_actions: AgentAction[];
}

export interface AgentAction {
  timestamp: string;
  action: string;
  details?: any;
}

export interface ArtifactResponse {
  session_id: string;
  study_plans: any[];
  notes: any[];
  progress: any[];
  memory: any;
}

export interface CreateSessionRequest {
  title?: string;
  subject: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; mode: string; components: any }>(
      '/health'
    );
  }

  // Session management
  async getSessions(): Promise<ChatSession[]> {
    return this.request<ChatSession[]>('/sessions');
  }

  async createSession(data: CreateSessionRequest): Promise<ChatSession> {
    return this.request<ChatSession>('/session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(sessionId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/session/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Chat functionality
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Artifacts
  async getArtifacts(sessionId: string): Promise<ArtifactResponse> {
    return this.request(`/artifacts/${sessionId}`);
  }

  async saveNotes(sessionId: string, title: string, content: string) {
    return this.request('/save-notes', {
      method: 'POST',
      body: JSON.stringify({ sessionId, title, content }),
    });
  }

  async updateProgress(sessionId: string, progressText: string) {
    return this.request('/update-progress', {
      method: 'POST',
      body: JSON.stringify({ sessionId, progressText }),
    });
  }

  // Agent logs
  async getAgentLogs(sessionId: string) {
    return this.request<{ logs: AgentAction[] }>(`/agent-logs/${sessionId}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Utility functions for frontend integration
export const apiUtils = {
  // Format chat response for frontend
  formatChatResponse: (response: ChatResponse): ChatMessage => ({
    role: 'assistant',
    content: response.response,
    timestamp: response.timestamp,
    tools: [], // Could be populated from agent actions
  }),

  // Extract agent actions for activity stream
  extractAgentActions: (response: ChatResponse): AgentAction[] => {
    return response.agent_actions || [];
  },

  // Check if backend is in mock mode
  isMockMode: async (): Promise<boolean> => {
    try {
      const health = await apiClient.healthCheck();
      return health.mode === 'mock';
    } catch {
      return true; // Assume mock if can't connect
    }
  },
};