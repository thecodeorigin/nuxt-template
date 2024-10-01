import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { kebabCase } from 'lodash-es'

describe('/projects/create', () => {
  it('should display the create project page', { timeout: 0 }, async ({ task }) => {
    await $page.goto('http://localhost:3000/projects/create')

    // Make sure button reset form project is enable
    const resetButtonEnable = await $page.$eval('button[data-test="button-reset-form-create-project"]', button => !button.disabled)
    expect(resetButtonEnable).toBe(true)

    const createButtonEnable = await $page.$eval('button[data-test="button-confirm-form-create-project"]', button => !button.disabled)
    expect(createButtonEnable).toBe(true)

    const selectFileButtonEnable = await $page.$eval('button[data-test="button-select-project-file"]', button => !button.disabled)
    expect(selectFileButtonEnable).toBe(true)

    const inputeSourceProjectURL = await $page.$eval('[data-test="input-project-source-url"] input[type="text"]', input => !input.disabled)
    expect(inputeSourceProjectURL).toBe(true)

    const inputProjectTitle = await $page.$eval('[data-test="input-enter-project-title"] input[type="text"]', input => !input.disabled)
    expect(inputProjectTitle).toBe(true)

    const textareProjectDescription = await $page.$eval('[data-test="input-enter-project-description"] textarea', textarea => !textarea.disabled)
    expect(textareProjectDescription).toBe(true)

    const inputVoiceRecognition = await $page.$eval('[data-test="input-confirm-voice-recognition"] input[type="checkbox"]', input => !input.disabled)
    expect(inputVoiceRecognition).toBe(true)

    await $page.locator('[data-test="dropdown-enter-project-category"]').click()
    const listOptions = await $page.$('.v-overlay__content.v-select__content')
    expect(listOptions).not.toBeNull()

    await $page.locator('[data-test="dropdown-enter-project-origin-language"]').click()
    const listOriginLanguages = await $page.$('.v-overlay__content.v-select__content')
    expect(listOriginLanguages).not.toBeNull()

    await $page.locator('[data-test="dropdown-enter-project-language"]').click()
    const listLanguages = await $page.$('.v-overlay__content.v-select__content')
    expect(listLanguages).not.toBeNull()

    await $page.locator('[data-test="dropdown-enter-project-model-AI"]').click()
    const listModalAIs = await $page.$('.v-overlay__content.v-select__content')
    expect(listModalAIs).not.toBeNull()

    await $page.goto('http://localhost:3000/projects/create')
    const [fileChooser] = await Promise.all([
      $page.waitForFileChooser(),
      $page.locator('[data-test="button-select-project-file"]').click(),
    ])
    await fileChooser.accept(['Random-file-names-for-automation-testing.mp4'])
    const buttonRemoveFile = await $page.$eval('button[data-test="button-remove-project-file"]', button => !button.disabled)
    expect(buttonRemoveFile).toBe(true)

    await $page.screenshot({
      path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '__screenshots__',
        `${kebabCase(task.name)}.png`,
      ),
    })
  })
})
