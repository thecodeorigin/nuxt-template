<script setup lang="ts">
const currentUser = useLogtoUser()

const credit = ref(currentUser?.custom_data?.credit || 0)

const creditApi = useApiCredit()

const isUpdatingCredit = ref(false)
async function handleUpdateCredit() {
  try {
    isUpdatingCredit.value = true

    const response = await creditApi.fetchCredit()

    credit.value = response.data?.custom_data?.credit || 0
  }
  catch {}
  finally {
    isUpdatingCredit.value = false
  }
}
</script>

<template>
  <UCard>
    <div>
      <strong>
        Available credits: {{ credit }}

        <UIcon
          name="i-heroicons-arrow-path"
          class="ml-1 cursor-pointer"
          :class="{ 'animate-spin': isUpdatingCredit }"
          @click="handleUpdateCredit"
        />
      </strong>
      <p>
        We will notify you if your credit is running low
      </p>
    </div>
    <div class="mt-4">
      <UButton color="neutral" variant="solid" to="/pricing">
        Buy more credit
      </UButton>
    </div>
  </UCard>
</template>
