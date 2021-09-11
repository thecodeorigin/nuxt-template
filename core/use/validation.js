import { useContext } from '@nuxtjs/composition-api';
import { VALIDATION_MESSAGE, VALIDATION_REGEX, VALIDATION_TYPE } from '@/constants/validation';

export const useValidation = () => {
  const { i18n } = useContext();

  // https://github.com/yiminghe/async-validator#validator
  // Use with: <el-form-item :rules="[rules.required, rules.email]">...
  const rules = {
    required: {
      required: true,
      message: i18n.t(VALIDATION_MESSAGE.REQUIRED)
    },
    email: {
      trigger: ['change'],
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error(i18n.t(VALIDATION_MESSAGE.REQUIRED)));
        } else if (!VALIDATION_REGEX.EMAIL.test(value)) {
          callback(new Error(i18n.t(VALIDATION_MESSAGE.EMAIL)));
        }
      },
    },
    phone: {
      trigger: ['change'],
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error(i18n.t(VALIDATION_MESSAGE.REQUIRED)));
        } else if (!VALIDATION_REGEX.PHONE.test(value)) {
          callback(new Error(i18n.t(VALIDATION_MESSAGE.PHONE)));
        }
      },
    },
    alpha: {
      trigger: ['change'],
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error(i18n.t(VALIDATION_MESSAGE.REQUIRED)));
        } else if (!VALIDATION_REGEX.ALPHA.test(value)) {
          callback(new Error(i18n.t(VALIDATION_MESSAGE.ALPHA)));
        }
      },
    },
    number: {
      trigger: ['change'],
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error(i18n.t(VALIDATION_MESSAGE.REQUIRED)));
        } else if (!VALIDATION_REGEX.NUMBER.test(value)) {
          callback(new Error(i18n.t(VALIDATION_MESSAGE.NUMBER)));
        }
      },
    },
    url: {
      trigger: ['change'],
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error(i18n.t(VALIDATION_MESSAGE.REQUIRED)));
        } else if (!VALIDATION_REGEX.URL.test(value)) {
          callback(new Error(i18n.t(VALIDATION_MESSAGE.URL)));
        }
      },
    },
  };

  return { rules, VALIDATION_TYPE };
};