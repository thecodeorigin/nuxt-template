import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { kebabCase } from 'lodash-es'

describe('/settings/account', () => {
  it('should display the account setting page', { timeout: 0 }, async ({ task }) => {
    await $page.goto('http://localhost:3000/settings/account')

    await $page.waitForSelector('[data-test="account-form"]')

    const uploadButton = await $page.$('[data-test="upload-photo-button"]')
    expect(uploadButton).not.toBeNull()
    const isDisabled = await uploadButton!.evaluate((button: any) => button.disabled)
    expect(isDisabled).toBe(false)

    const resetButton = await $page.$('[data-test="reset-photo-button"]')
    expect(resetButton).not.toBeNull()
    const isResetDisabled = await resetButton?.evaluate((button: any) => button.disabled)
    expect(isResetDisabled).toBe(false)

    const fullnameInputWrapper = await $page.$('[data-test="full-name-input"]')
    expect(fullnameInputWrapper).not.toBeNull()
    const fullnameInput = await fullnameInputWrapper?.$('input')
    expect(fullnameInput).not.toBeNull()
    const fullnameInputValue = await fullnameInput!.evaluate((input: any) => input.disabled)
    expect(fullnameInputValue).toBe(false)

    const emailInputWrapper = await $page.$('[data-test="email-input"]')
    expect(emailInputWrapper).not.toBeNull()
    const emailInput = await emailInputWrapper?.$('input')
    expect(emailInput).not.toBeNull()
    const isEmailDisabled = await emailInput!.evaluate((input: any) => input.disabled)
    expect(isEmailDisabled).toBe(true)

    const organizationInputWrapper = await $page.$('[data-test="organization-input"]')
    expect(organizationInputWrapper).not.toBeNull()
    const organizationInput = await organizationInputWrapper?.$('input')
    expect(organizationInput).not.toBeNull()
    const isOrganizationDisabled = await organizationInput!.evaluate((input: any) => input.disabled)
    expect(isOrganizationDisabled).toBe(false)

    const phoneInputWrapper = await $page.$('[data-test="phone-input"]')
    expect(phoneInputWrapper).not.toBeNull()
    const phoneInput = await phoneInputWrapper?.$('input')
    expect(phoneInput).not.toBeNull()
    const isPhoneDisabled = await phoneInput!.evaluate((input: any) => input.disabled)
    expect(isPhoneDisabled).toBe(false)

    const addressInputWrapper = await $page.$('[data-test="address-input"]')
    expect(addressInputWrapper).not.toBeNull()
    const addressInput = await addressInputWrapper?.$('input')
    expect(addressInput).not.toBeNull()
    const isAddressDisabled = await addressInput!.evaluate((input: any) => input.disabled)
    expect(isAddressDisabled).toBe(false)

    const zipCodeInputWrapper = await $page.$('[data-test="zip-code-input"]')
    expect(zipCodeInputWrapper).not.toBeNull()
    const zipCodeInput = await zipCodeInputWrapper?.$('input')
    expect(zipCodeInput).not.toBeNull()
    const isZipCodeDisabled = await zipCodeInput!.evaluate((input: any) => input.disabled)
    expect(isZipCodeDisabled).toBe(false)

    const saveButton = await $page.$('[data-test="save-button"]')
    expect(saveButton).not.toBeNull()
    const isSaveDisabled = await saveButton?.evaluate((button: any) => button.disabled)
    expect(isSaveDisabled).toBe(false)

    const resetButton2 = await $page.$('[data-test="reset-button"]')
    expect(resetButton2).not.toBeNull()
    const isResetDisabled2 = await resetButton2?.evaluate((button: any) => button.disabled)
    expect(isResetDisabled2).toBe(false)

    await $page.screenshot({
      path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '__screenshots__',
        `${kebabCase(task.name)}.png`,
      ),
    })
  })
})
