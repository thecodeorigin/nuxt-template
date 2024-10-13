<script lang="ts" setup>
import { getSingletonHighlighter } from 'shikiji'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

type CodeLanguages = 'ts' | 'js'

interface Props {
  title: string
  code: CodeProp
  codeLanguage?: string
  noPadding?: boolean
}

type CodeProp = Record<CodeLanguages, string>

const props = withDefaults(defineProps<Props>(), {
  codeLanguage: 'markup',
  noPadding: false,
})

const preferredCodeLanguage = useCookie<CodeLanguages>('preferredCodeLanguage', {
  default: () => 'ts',
  maxAge: COOKIE_MAX_AGE_1_YEAR,
})

const isCodeShown = ref(false)

const { copy, copied } = useClipboard({ source: computed(() => props.code[preferredCodeLanguage.value]) })

const highlighter = await getSingletonHighlighter({
  themes: ['dracula', 'dracula-soft'],
  langs: ['vue'],
})

const codeSnippet = highlighter.codeToHtml(props.code[preferredCodeLanguage.value], {
  lang: 'vue',
  theme: 'dracula',
})
</script>

<template>
  <!-- eslint-disable regex/invalid -->
  <VCard class="app-card-code">
    <VCardItem>
      <VCardTitle>{{ props.title }}</VCardTitle>
      <template #append>
        <IconBtn
          :color="isCodeShown ? 'primary' : 'default'"
          :class="isCodeShown ? '' : 'text-disabled'"
          @click="isCodeShown = !isCodeShown"
        >
          <VIcon
            size="20"
            icon="ri-code-s-line"
          />
        </IconBtn>
      </template>
    </VCardItem>
    <slot v-if="noPadding" />
    <VCardText v-else>
      <slot />
    </VCardText>
    <VExpandTransition>
      <div v-show="isCodeShown">
        <VDivider />

        <VCardText class="d-flex gap-y-3 flex-column">
          <div class="d-flex justify-end">
            <VBtnToggle
              v-model="preferredCodeLanguage"
              mandatory
              density="compact"
            >
              <VBtn
                value="ts"
                icon
                :variant="preferredCodeLanguage === 'ts' ? 'tonal' : 'text'"
                :color="preferredCodeLanguage === 'ts' ? 'primary' : ''"
              >
                <VIcon
                  icon="mdi-language-typescript"
                  :color="preferredCodeLanguage === 'ts' ? 'primary' : 'secondary'"
                />
              </VBtn>

              <VBtn
                value="js"
                icon
                :variant="preferredCodeLanguage === 'js' ? 'tonal' : 'text'"
                :color="preferredCodeLanguage === 'js' ? 'primary' : ''"
              >
                <VIcon
                  icon="mdi-language-javascript"
                  :color="preferredCodeLanguage === 'js' ? 'primary' : 'secondary'"
                />
              </VBtn>
            </VBtnToggle>
          </div>

          <div class="position-relative">
            <PerfectScrollbar
              style="border-radius: 6px;max-block-size: 500px;"
              :options="{ wheelPropagation: false, suppressScrollX: false }"
            >
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span v-html="codeSnippet" />
            </PerfectScrollbar>
            <IconBtn
              class="position-absolute app-card-code-copy-icon"
              color="white"
              @click="() => { copy() }"
            >
              <VIcon
                :icon="copied ? 'ri-check-line' : 'ri-file-copy-line'"
                size="20"
              />
            </IconBtn>
          </div>
        </VCardText>
      </div>
    </VExpandTransition>
  </VCard>
</template>

<style lang="scss">
@use "@base/styles/variables/vuetify.scss";

code[class*="language-"],
pre[class*="language-"] {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 14px;
}

:not(pre) > code[class*="language-"],
pre[class*="language-"] {
  border-radius: vuetify.$card-border-radius;
  max-block-size: 500px;
}

.app-card-code-copy-icon {
  inset-block-start: 1.2em;
  inset-inline-end: 0.8em;
}

.app-card-code {
  .shiki {
    padding: 0.75rem;
    text-wrap: wrap;
  }
}
</style>
