import { PROJECT_API_URL } from '@/constants/project';

export default {
  getMany(_) {
    return this.$axios.$get(PROJECT_API_URL.GET_MANY());
  },
  getOne(_, { id }) {
    return this.$axios.$get(PROJECT_API_URL.GET_ONE(id));
  },
  createOne(_, { body }) {
    return this.$axios.$post(PROJECT_API_URL.CREATE_ONE(), body);
  },
  updateOne(_, { body, id }) {
    return this.$axios.$put(PROJECT_API_URL.UPDATE_ONE(id), body);
  },
  deleteOne(_, { id }) {
    return this.$axios.$delete(PROJECT_API_URL.DELETE_ONE(id));
  },
};
