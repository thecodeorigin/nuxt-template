<script setup lang="ts">
const inStock = ref(true)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between gap-4 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 mb-1">
          Add a new project
        </h4>
        <p class="text-body-1 mb-0">
          Orders placed across your store
        </p>
      </div>

      <div class="d-flex gap-4 align-center flex-wrap">
        <VBtn
          variant="outlined"
          color="secondary"
        >
          Discard
        </VBtn>
        <VBtn
          variant="outlined"
          color="primary"
        >
          Save Draft
        </VBtn>
        <VBtn>Publish Project</VBtn>
      </div>
    </div>

    <VRow>
      <VCol md="8">
        <ProjectFileUploader />

        <VCard title="Project Information">
          <VCardText>
            <VRow>
              <VCol md="6" cols="12">
                <VTextField
                  label="Name"
                  placeholder="Project's Name"
                />
              </VCol>
              <VCol md="6" cols="12">
                <VSelect
                  placeholder="Select Category"
                  label="Category"
                  :items="['Household', 'Office', 'Electronics', 'Management', 'Automotive']"
                >
                  <template #append>
                    <IconBtn
                      size="large"
                      variant="outlined"
                      color="primary"
                      rounded
                    >
                      <VIcon
                        size="28"
                        icon="ri-add-line"
                      />
                    </IconBtn>
                  </template>
                </VSelect>
              </VCol>
              <VCol cols="12">
                <VTextarea
                  label="Description"
                  placeholder="Project's Description"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        md="4"
        cols="12"
      >
        <VCard title="AI Options" class="mb-6">
          <VCardText>
            <div class="d-flex flex-raw align-center justify-space-between mb-5">
              <span>Speaker Recognition</span>
              <VSwitch
                v-model="inStock"
                density="compact"
              />
            </div>
            <div class="d-flex flex-column gap-y-5">
              <VSelect
                placeholder="Select Language"
                label="Language"
                :items="['English', 'Tiếng Việt', '日本語', '한국어']"
              />
              <VSelect
                placeholder="Select AI Model"
                label="Model"
                :items="['Fast', 'Balance', 'Accurate']"
              />
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
