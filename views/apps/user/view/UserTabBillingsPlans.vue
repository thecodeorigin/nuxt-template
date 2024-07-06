<script setup lang="ts">
import americanExpress from '@images/icons/payments/american-express.png'
import mastercard from '@images/icons/payments/mastercard.png'
import visa from '@images/icons/payments/visa.png'

interface CardDetail {
  name: string
  number: string
  expiry: string
  isPrimary: boolean
  type: string
  cvv: string
  image: string
}

interface BillingAddress {
  firstName: string
  lastName: string
  selectedCountry: string | null
  addressLine1: string
  addressLine2: string
  landmark: string
  contact: string
  country: string | null
  state: string
  zipCode: number | null
}

const isUpgradePlanDialogVisible = ref(false)

const currentCardDetails = ref()
const isCardEditDialogVisible = ref(false)
const isCardAddDialogVisible = ref(false)
const isEditAddressDialogVisible = ref(false)

const openEditCardDialog = (cardDetails: CardDetail) => {
  currentCardDetails.value = cardDetails

  isCardEditDialogVisible.value = true
}

const creditCards: CardDetail[] = [
  {
    name: 'Tom McBride',
    number: '4851234567899865',
    expiry: '12/24',
    isPrimary: true,
    type: 'mastercard',
    cvv: '123',
    image: mastercard,
  },
  {
    name: 'Mildred Wagner',
    number: '5531234567895678',
    expiry: '02/24',
    isPrimary: false,
    type: 'visa',
    cvv: '456',
    image: visa,
  },
  {
    name: 'Lester Jennings',
    number: '5531234567890002',
    expiry: '08/20',
    isPrimary: false,
    type: 'visa',
    cvv: '456',
    image: americanExpress,
  },
]

const currentBillingAddress = {
  companyName: 'Pixinvent',
  billingEmail: 'gertrude@gmail.com',
  taxID: 'TAX-875623',
  vatNumber: 'SDF754K77',
  address: '100 Water Plant Avenue, Building 1303 Wake Island',
  contact: '+1(609) 933-44-22',
  country: 'USA',
  state: 'Queensland',
  zipCode: 403114,
}

const editBillingData: BillingAddress = {
  firstName: 'Gertrude',
  lastName: 'Jennings',
  selectedCountry: 'USA',
  addressLine1: '100 Water Plant Avenue',
  addressLine2: 'Building 1303 Wake Island',
  landmark: 'Near Wake Island',
  contact: '+1(609) 933-44-22',
  country: 'USA',
  state: 'Queensland',
  zipCode: 403114,
}
</script>

<template>
  <VRow>
    <!-- 👉 Current Plan -->
    <VCol cols="12">
      <VCard title="Current Plan">
        <VCardText>
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <h6 class="text-h6 mb-1">
                Your Current Plan is Basic
              </h6>
              <p>A simple start for everyone</p>

              <h6 class="text-h6 mb-1">
                Active until Dec 09, 2021
              </h6>
              <p>We will send you a notification upon Subscription expiration</p>

              <h6 class="text-h6 mb-1">
                <span class="me-2">$199 Per Month</span>
                <VChip
                  color="primary"
                  size="small"
                >
                  Popular
                </VChip>
              </h6>
              <p class="mb-0">
                Standard plan for small to medium businesses
              </p>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <!-- 👉 Alert -->
              <VAlert
                color="warning"
                variant="tonal"
                icon="ri-alert-line"
                closable
              >
                <VAlertTitle>We need your attention!</VAlertTitle>
                <span>Your plan requires update</span>
              </VAlert>

              <!-- 👉 Progress -->
              <div class="d-flex justify-space-between font-weight-bold mt-4 mb-1">
                <h6 class="text-h6">
                  Days
                </h6>
                <h6 class="text-h6">
                  26 of 30 Days
                </h6>
              </div>

              <VProgressLinear
                rounded
                color="primary"
                :height="10"
                :model-value="75"
              />
              <p class="text-sm mt-1">
                Your plan requires update
              </p>
            </VCol>

            <VCol cols="12">
              <div class="d-flex flex-wrap gap-4">
                <VBtn @click="isUpgradePlanDialogVisible = true">
                  upgrade plan
                </VBtn>

                <VBtn
                  color="error"
                  variant="outlined"
                >
                  Cancel Subscription
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 Payment Methods -->
    <VCol cols="12">
      <VCard title="Payment Methods">
        <template #append>
          <VBtn
            size="small"
            prepend-icon="ri-add-line"
            @click="isCardAddDialogVisible = !isCardAddDialogVisible"
          >
            Add Card
          </VBtn>
        </template>

        <VCardText class="d-flex flex-column gap-y-4">
          <VCard
            v-for="card in creditCards"
            :key="card.name"
            border
            flat
          >
            <VCardText class="d-flex flex-sm-row flex-column justify-space-between align-sm-center gap-6">
              <div class="text-no-wrap">
                <VImg
                  :src="card.image"
                  max-width="90"
                  width="auto"
                  :height="25"
                />
                <h6 class="text-h6 my-2 d-flex gap-2 align-center">
                  <div>{{ card.name }}</div>
                  <VChip
                    v-if="card.isPrimary"
                    color="primary"
                    size="small"
                  >
                    Primary
                  </VChip>
                </h6>
                <span class="text-body-1">**** **** **** {{ card.number.substring(card.number.length - 4) }}</span>
              </div>

              <div class="d-flex flex-column text-sm-end gap-4">
                <div class="order-sm-0 order-1">
                  <VBtn
                    variant="outlined"
                    class="me-4"
                    size="small"
                    @click="openEditCardDialog(card)"
                  >
                    Edit
                  </VBtn>
                  <VBtn
                    color="error"
                    size="small"
                    variant="outlined"
                  >
                    Delete
                  </VBtn>
                </div>
                <span class="text-body-2 order-sm-1 order-0">Card expires at {{ card.expiry }}</span>
              </div>
            </VCardText>
          </VCard>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <!-- 👉 Billing Address -->
      <VCard title="Billing Address">
        <template #append>
          <VBtn
            size="small"
            prepend-icon="ri-add-line"
            @click="isEditAddressDialogVisible = !isEditAddressDialogVisible"
          >
            Edit Address
          </VBtn>
        </template>

        <VCardText>
          <VRow>
            <VCol
              cols="12"
              lg="6"
            >
              <VTable class="billing-address-table">
                <tr>
                  <td>
                    <h6 class="text-h6 text-no-wrap mb-2">
                      Company Name:
                    </h6>
                  </td>
                  <td>
                    <p class="text-body-1 mb-2">
                      {{ currentBillingAddress.companyName }}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h6 class="text-h6 text-no-wrap mb-2">
                      Billing Email:
                    </h6>
                  </td>
                  <td>
                    <p class="text-body-1 mb-2 text-wrap">
                      {{ currentBillingAddress.billingEmail }}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h6 class="text-h6 text-no-wrap mb-2">
                      Tax ID:
                    </h6>
                  </td>
                  <td>
                    <p class="text-body-1 mb-2">
                      {{ currentBillingAddress.taxID }}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h6 class="text-h6 text-no-wrap mb-2">
                      VAT Number:
                    </h6>
                  </td>
                  <td>
                    <p class="text-body-1 mb-2">
                      {{ currentBillingAddress.vatNumber }}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td class="d-flex align-baseline">
                    <h6 class="text-h6 text-no-wrap">
                      Billing Address:
                    </h6>
                  </td>
                  <td>
                    <p class="text-body-1 mb-0">
                      {{ currentBillingAddress.address }}
                    </p>
                  </td>
                </tr>
              </VTable>
            </VCol>

            <VCol
              cols="12"
              lg="6"
            >
              <VTable class="billing-address-table">
                <tr>
                  <td>
                    <h6 class="text-h6 text-no-wrap mb-2">
                      Contact:
                    </h6>
                  </td>
                  <td>
                    <p class="text-body-1 mb-2">
                      {{ currentBillingAddress.contact }}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h6 class="text-h6 text-no-wrap mb-2">
                      Country:
                    </h6>
                  </td>
                  <td>
                    <p class="text-body-1 mb-2">
                      {{ currentBillingAddress.country }}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h6 class="text-h6 text-no-wrap mb-2">
                      State:
                    </h6>
                  </td>
                  <td>
                    <p class="text-body-1 mb-2">
                      {{ currentBillingAddress.state }}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h6 class="text-h6 text-no-wrap">
                      Zip Code:
                    </h6>
                  </td>
                  <td>
                    <p class="text-body-1 mb-0">
                      {{ currentBillingAddress.zipCode }}
                    </p>
                  </td>
                </tr>
              </VTable>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- 👉 Edit Card Dialog -->
  <CardAddEditDialog
    v-model:isDialogVisible="isCardEditDialogVisible"
    :card-details="currentCardDetails"
  />

  <!-- 👉 Add Card Dialog -->
  <CardAddEditDialog v-model:isDialogVisible="isCardAddDialogVisible" />

  <!-- 👉 Edit Address dialog -->
  <AddEditAddressDialog
    v-model:isDialogVisible="isEditAddressDialogVisible"
    :billing-address="editBillingData"
  />

  <!-- 👉 Upgrade plan dialog -->
  <UserUpgradePlanDialog v-model:isDialogVisible="isUpgradePlanDialogVisible" />
</template>

<style lang="scss">
.billing-address-table {
  tr {
    td:first-child {
      inline-size: 148px;
    }
  }
}
</style>
