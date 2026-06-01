import type { SelfhostAudit } from '#layers/selfhost/server/db/schema'

export interface SelfhostStatus {
  status: 'idle' | 'deploying' | 'deployed' | 'failed'
  cf_account_id?: string | null
  cf_script_name?: string | null
  workers_dev_url?: string | null
  deployed_version?: string | null
  deployed_at?: string | null
  cf_token_expires_at?: string | null
  last_error?: string | null
  latest_version: string | null
  update_available: boolean
  has_stored_token: boolean
}

export interface DeployResult { url: string, version: string }

export interface CloudflareAccount { id: string, name: string }

export function useSelfhostApi() {
  function fetchSelfhostStatus() {
    return $http<SelfhostStatus>('/api/selfhost/status')
  }

  function listCloudflareAccounts(token: string) {
    return $http<{ accounts: CloudflareAccount[] }>('/api/selfhost/cf-accounts', { method: 'POST', body: { token } })
  }

  function deploySelfhost(input: { token?: string, account_id?: string }) {
    return $http<DeployResult>('/api/selfhost/deploy', { method: 'POST', body: input })
  }

  function disconnectSelfhost() {
    return $http<{ success: boolean }>('/api/selfhost/disconnect', { method: 'POST' })
  }

  function fetchSelfhostAudit() {
    return $http<{ audits: SelfhostAudit[] }>('/api/selfhost/audit')
  }

  function fetchSelfhostSecrets() {
    return $http<{ items: SelfhostSecretItem[] }>('/api/selfhost/secrets')
  }

  function patchSelfhostSecrets(updates: Array<{ key: string, value: string }>) {
    return $http<{ updated: number, pushedToCloudflare: number }>('/api/selfhost/secrets', {
      method: 'PATCH',
      body: { updates },
    })
  }

  function testSelfhostEmail(to: string) {
    return $http<{ reachable: boolean, status: number, workerUrl: string, note: string }>('/api/selfhost/test-email', {
      method: 'POST',
      body: { to },
    })
  }

  return { fetchSelfhostStatus, listCloudflareAccounts, deploySelfhost, disconnectSelfhost, fetchSelfhostAudit, fetchSelfhostSecrets, patchSelfhostSecrets, testSelfhostEmail }
}

export interface SelfhostSecretItem {
  key: string
  label: string
  description: string
  category: 'auth' | 'oauth' | 'smtp' | 'payments' | 'system' | 'support'
  type: 'secret_text' | 'plain_text'
  isAuto: boolean
  isSet: boolean
  updatedAt: string | null
}
