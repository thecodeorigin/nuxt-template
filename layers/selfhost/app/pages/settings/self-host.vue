<script setup lang="ts">
import type { CloudflareAccount, SelfhostStatus } from '#layers/selfhost/app/api/useSelfhostApi'
import { useSelfhostApi } from '#layers/selfhost/app/api/useSelfhostApi'
import SelfhostSecretsCard from '#layers/selfhost/app/components/Selfhost/SelfhostSecretsCard.vue'

definePageMeta({ can: ['selfhost:read', 'selfhost:manage'] })
useHead({ title: 'Self-hosting' })

const toast = useToast()
const api = useSelfhostApi()
const tokenInput = ref('')
const deploying = ref(false)
const disconnecting = ref(false)
const fetchingAccounts = ref(false)

const accounts = ref<CloudflareAccount[]>([])
const selectedAccountId = ref<string | undefined>(undefined)

const { data: status, refresh } = useAsyncData<SelfhostStatus | null>(
  'selfhost-status',
  () => api.fetchSelfhostStatus(),
  { default: () => null },
)

const statusColor = computed(() => {
  const s = status.value?.status
  if (s === 'deployed')
    return 'success' as const
  if (s === 'failed')
    return 'error' as const
  return 'warning' as const
})

const tokenExpiresInDays = computed(() => {
  const iso = status.value?.cf_token_expires_at
  if (!iso)
    return null
  return Math.floor((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
})

const TOKEN_CREATE_URL = 'https://dash.cloudflare.com/profile/api-tokens/create'

async function loadAccountsForToken() {
  const token = tokenInput.value.trim()
  if (!token)
    return
  fetchingAccounts.value = true
  try {
    const result = await api.listCloudflareAccounts(token)
    accounts.value = result.accounts
    // If only one account, auto-select it; otherwise leave blank to force a choice.
    selectedAccountId.value = accounts.value.length === 1 ? accounts.value[0]!.id : undefined
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    toast.add({
      title: 'Could not read accounts from this token',
      description: err?.data?.statusMessage ?? 'Verify the token has Account Settings: Read.',
      color: 'error',
    })
    accounts.value = []
    selectedAccountId.value = undefined
  }
  finally {
    fetchingAccounts.value = false
  }
}

async function deploy() {
  deploying.value = true
  try {
    const token = tokenInput.value.trim() || undefined
    // If a token was pasted but the user hasn't picked an account yet, ask now.
    if (token && accounts.value.length > 1 && !selectedAccountId.value) {
      toast.add({ title: 'Pick a Cloudflare account', color: 'warning' })
      return
    }
    const result = await api.deploySelfhost({ token, account_id: selectedAccountId.value })
    toast.add({
      title: `Deployed ${result.version}`,
      description: result.url,
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    tokenInput.value = ''
    accounts.value = []
    selectedAccountId.value = undefined
    await refresh()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string, data?: { code?: string, accounts?: CloudflareAccount[] } }, message?: string }
    // If the server returned a 409 with the list of accounts (token saw multiple), surface the picker.
    if (err?.data?.data?.code === 'multiple_accounts' && err.data.data.accounts) {
      accounts.value = err.data.data.accounts
      selectedAccountId.value = undefined
      toast.add({
        title: 'Multiple Cloudflare accounts',
        description: 'Pick which account to deploy into below, then click Deploy again.',
        color: 'warning',
      })
      return
    }
    toast.add({
      title: 'Deploy failed',
      description: err?.data?.statusMessage ?? err?.message ?? 'Unknown error',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  }
  finally {
    deploying.value = false
  }
}

async function disconnect() {
  disconnecting.value = true
  try {
    await api.disconnectSelfhost()
    toast.add({ title: 'Disconnected', color: 'success' })
    accounts.value = []
    selectedAccountId.value = undefined
    await refresh()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    toast.add({ title: 'Disconnect failed', description: err?.data?.statusMessage, color: 'error' })
  }
  finally {
    disconnecting.value = false
  }
}

const accountItems = computed(() =>
  accounts.value.map(a => ({ label: `${a.name} — ${a.id.slice(0, 8)}…`, value: a.id })),
)
</script>

<template>
  <UDashboardPanel id="self-host">
    <template #header>
      <div class="px-4 py-3 border-b border-default">
        <h1 class="text-lg font-semibold">
          Self-hosting
        </h1>
        <p class="text-sm text-muted">
          Deploy this application to your own Cloudflare account.
        </p>
      </div>
    </template>

    <template #body>
      <div class="max-w-2xl mx-auto p-6 space-y-6">
        <UAlert
          v-if="status?.update_available"
          color="warning"
          icon="i-lucide-refresh-cw"
          title="Update available"
          :description="`New version ${status.latest_version} is available (deployed: ${status.deployed_version})`"
        >
          <template #actions>
            <UButton :loading="deploying" color="warning" size="sm" @click="deploy">
              Update
            </UButton>
          </template>
        </UAlert>

        <UAlert
          v-if="tokenExpiresInDays !== null && tokenExpiresInDays <= 14"
          color="warning"
          icon="i-lucide-clock"
          title="Cloudflare token expiring soon"
          :description="`Your stored token expires in ${tokenExpiresInDays} day(s). Paste a new token and redeploy to refresh it.`"
        />

        <UCard v-if="status?.status && status.status !== 'idle'">
          <template #header>
            <div class="flex items-center justify-between">
              <p class="font-semibold">
                Deployment
              </p>
              <UBadge :color="statusColor" variant="subtle">
                {{ status.status }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-2 text-sm">
            <p v-if="status.workers_dev_url">
              <span class="text-muted">URL:</span>
              <a :href="status.workers_dev_url" target="_blank" rel="noopener" class="text-primary hover:underline ml-1">
                {{ status.workers_dev_url }}
              </a>
            </p>
            <p v-if="status.deployed_version">
              <span class="text-muted">Version:</span> {{ status.deployed_version }}
            </p>
            <p v-if="status.cf_account_id">
              <span class="text-muted">Cloudflare account:</span> <code class="text-xs">{{ status.cf_account_id }}</code>
            </p>
            <p v-if="status.last_error" class="text-error">
              {{ status.last_error }}
            </p>
          </div>

          <template #footer>
            <UButton :loading="disconnecting" color="error" variant="soft" size="sm" @click="disconnect">
              Disconnect
            </UButton>
          </template>
        </UCard>

        <SelfhostSecretsCard
          v-if="status?.status === 'deployed'"
          :workers-dev-url="status.workers_dev_url"
        />

        <UCard>
          <template #header>
            <p class="font-semibold">
              {{ status?.status === 'deployed' ? 'Redeploy' : 'Deploy to your Cloudflare account' }}
            </p>
          </template>

          <div class="space-y-4">
            <details class="text-sm">
              <summary class="cursor-pointer text-primary hover:underline">
                How do I get a Cloudflare API token?
              </summary>
              <ol class="mt-2 list-decimal pl-6 space-y-1 text-muted">
                <li>
                  Go to
                  <a :href="TOKEN_CREATE_URL" target="_blank" rel="noopener" class="text-primary hover:underline">
                    Cloudflare → My Profile → API Tokens → Create Token
                  </a>
                </li>
                <li>Choose <strong>Create Custom Token</strong></li>
                <li>
                  Add these permissions (all <strong>Edit</strong> unless noted):
                  Workers Scripts, Workers KV Storage, Workers R2 Storage, D1,
                  Account Settings (Read), User Details (Read)
                </li>
                <li>Account Resources: include all accounts (or pick one)</li>
                <li>Continue → Create Token → copy the token (shown once)</li>
              </ol>
            </details>

            <UFormField label="Cloudflare API Token" help="Leave blank to redeploy using the stored token.">
              <UInput
                v-model="tokenInput"
                type="password"
                placeholder="•••••••••••••••••••••••••••••••"
                class="w-full font-mono"
                autocomplete="off"
                @blur="loadAccountsForToken"
              />
            </UFormField>

            <UFormField
              v-if="accounts.length > 0"
              label="Cloudflare account"
              :help="accounts.length === 1 ? 'Auto-selected (this token has access to one account).' : 'Pick which account to deploy into.'"
            >
              <USelect
                v-model="selectedAccountId"
                :items="accountItems"
                :loading="fetchingAccounts"
                :disabled="accounts.length === 1"
                placeholder="Select an account"
                class="w-full"
              />
            </UFormField>

            <UButton
              :loading="deploying"
              :disabled="status?.status === 'deploying'"
              @click="deploy"
            >
              {{ status?.status === 'deployed' ? 'Redeploy' : 'Deploy' }}
            </UButton>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
