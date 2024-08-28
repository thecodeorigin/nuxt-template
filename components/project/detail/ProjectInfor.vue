<script setup lang="ts">
import ProjectEditField from '../edit/ProjectEditField.vue'

const project = defineModel<any>({ required: true })

const isEditTitleVisible = ref(false)
const isEditDescriptionVisible = ref(false)
</script>

<template>
  <VCardText>
    <div v-if="!isEditTitleVisible">
      <div>
        <div class="d-flex justify-between items-center gap-4 label">
          <h5 class="text-h5 mb-4">
            Title
          </h5>
          <VChip
            color="secondary"
            size="small"
            label
            class="cursor-pointer edit-btn"
            @click="isEditTitleVisible = true"
          >
            <v-icon icon="ri-edit-box-line" />
            Edit
          </VChip>
        </div>
      </div>
      <p>
        {{ project?.title }}
      </p>
    </div>

    <div v-else>
      <ProjectEditField
        v-model="project.title"
        v-model:isEditVisible="isEditTitleVisible"
        :project-id="project.id"
        input-type="input"
        label="Title"
        field-name="title"
      />
    </div>
    <VDivider class="my-6" />

    <div v-if="!isEditDescriptionVisible">
      <div class="d-flex justify-between items-center gap-4 label">
        <h5 class="text-h5 mb-4">
          Description
        </h5>
        <VChip
          color="secondary"
          size="small"
          label
          class="cursor-pointer edit-btn"
          @click="isEditDescriptionVisible = true"
        >
          <v-icon icon="ri-edit-box-line" />
          Edit
        </VChip>
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="project?.description" />
    </div>

    <div v-else>
      <ProjectEditField
        v-model="project.description"
        v-model:isEditVisible="isEditDescriptionVisible"
        :project-id="project.id"
        input-type="textarea"
        label="Description"
        field-name="description"
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
