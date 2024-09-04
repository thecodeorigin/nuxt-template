<script setup lang="ts">
const project = defineModel<any>({ required: true })

const projectStore = useProjectStore()

async function handleUpdateProject(field: string, value: string) {
  try {
    await projectStore.updateProject(project.value.id, { [field]: value })
  }
  catch (error) {
    console.error('error', error)
  }
}
</script>

<template>
  <VCardText>
    <div>
      <div class="d-flex justify-between items-center gap-4 label">
        <h5 class="text-h5 mb-4">
          Title
        </h5>
      </div>

      <VTextarea
        v-model="project.title"
        class="textarea-custom"
        name="title"
        auto-grow
        rows="1"
        @blur="handleUpdateProject('title', project.title)"
      />
    </div>

    <div>
      <div class="d-flex justify-between items-center gap-4 mt-5 label">
        <h5 class="text-h5 mb-4">
          Description
        </h5>
      </div>

      <VTextarea
        v-model="project.description"
        class="textarea-custom"
        name="description"
        auto-grow
        rows="1"
        @blur="handleUpdateProject('description', project.description)"
      />
    </div>

    <VDivider class="my-6" />

    <h5 class="text-h5 mb-4">
      Information
    </h5>
    <div class="d-flex gap-x-12 gap-y-5 flex-wrap">
      <div>
        <VList class="card-list text-medium-emphasis">
          <VListItem>
            <template #prepend>
              <VIcon
                icon="ri-check-line"
                size="20"
                class="me-n1"
              />
            </template>
            <VListItemTitle>Model: {{ project?.model }}</VListItemTitle>
          </VListItem>
        </VList>
      </div>

      <div>
        <VList class="card-list text-medium-emphasis">
          <VListItem>
            <template #prepend>
              <VIcon
                icon="ri-global-line"
                size="20"
                class="me-n1"
              />
            </template>
            <VListItemTitle>Languages: {{ project?.translate_from }} -> {{ project?.translate_to }}</VListItemTitle>
          </VListItem>
        </VList>
      </div>
    </div>
  </VCardText>
</template>

<style scoped>
.edit-btn {
  display: none;
}

.label:hover .edit-btn {
  display: block;
}
</style>
