import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL && typeof window !== 'undefined') {
  console.error(
    'CRITICAL ARCHITECTURAL ERROR: NEXT_PUBLIC_API_BASE_URL environment variable is missing. Please define it in your .env.local file.'
  );
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return {};
  }
  try {
    const token = await currentUser.getIdToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  } catch (err) {
    console.error('Failed to retrieve Firebase ID Token', err);
    return {};
  }
}

export async function adminFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('Environment variable NEXT_PUBLIC_API_BASE_URL is not configured.');
  }

  const authHeaders = await getAuthHeader();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg =
      data.error && typeof data.error === 'object' && 'message' in data.error
        ? data.error.message
        : data.message || data.error || `API Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Specific Admin Endpoints matching backend routes (/admin/...)
export const adminApi = {
  listTeams: (query?: { search?: string; sortBy?: string; sortDir?: string }) => {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortDir) params.append('sortDir', query.sortDir);
    const queryString = params.toString();
    return adminFetch<{ teams: any[] }>(`/admin/teams${queryString ? `?${queryString}` : ''}`);
  },

  createTeam: (payload: {
    name: string;
    timezone?: string;
    renewalDate?: string;
    headCoachEmail: string;
    headCoachFirstName?: string;
    headCoachLastName?: string;
    strengthCoachEmail?: string;
  }) => {
    return adminFetch<{ teamId: string; teamCode: string; renewalDate: string }>('/admin/teams', {
      method: 'POST',
      body: JSON.stringify({
        timezone: 'America/New_York',
        ...payload,
      }),
    });
  },

  inviteCoach: (teamId: string, payload: { email: string; firstName?: string; lastName?: string; assignedRole: 'headCoach' | 'strengthCoach' | 'assistantCoach' }) => {
    return adminFetch<{ inviteId: string }>(`/admin/teams/${teamId}/inviteCoach`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateTeamStatus: (teamId: string, status: 'active' | 'paused' | 'archived') => {
    return adminFetch<{ ok: boolean }>(`/admin/teams/${teamId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  resendInvite: (inviteId: string) => {
    return adminFetch<{ ok: boolean }>(`/admin/coachInvites/${inviteId}/resend`, {
      method: 'POST',
    });
  },

  disableCoach: (teamId: string, coachUid: string) => {
    return adminFetch<{ ok: boolean }>(`/admin/teams/${teamId}/coaches/${coachUid}/disable`, {
      method: 'POST',
    });
  },

  cancelInvite: (teamId: string, email: string) => {
    return adminFetch<{ ok: boolean }>(`/admin/teams/${teamId}/invites/cancel`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  replaceCoach: (teamId: string, coachUid: string, payload: { email: string; firstName?: string; lastName?: string }) => {
    return adminFetch<{ ok: boolean; inviteId: string }>(`/admin/teams/${teamId}/coaches/${coachUid}/replace`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteTeam: (teamId: string) => {
    return adminFetch<{ ok: boolean }>(`/admin/teams/${teamId}`, {
      method: 'DELETE',
    });
  },

  updateTeamSubscription: (teamId: string, payload: { subscriptionStart?: string; renewalDate?: string }) => {
    return adminFetch<{ ok: boolean }>(`/admin/teams/${teamId}/subscription`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  updateCoachEmail: (coachUid: string, email: string) => {
    return adminFetch<{ ok: boolean }>(`/admin/coaches/${coachUid}/email`, {
      method: 'PATCH',
      body: JSON.stringify({ email }),
    });
  },
};
