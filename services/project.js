import { useContext } from '@nuxtjs/composition-api';

export const useProjectService = (context) => {
  const { $axios } = context || useContext();

  const getProjects = () => $axios.$get('/projects');

  const getProject = (slug) => $axios.$get(`/projects/${slug}`);

  const createProject = (form) => $axios.$post('/projects', form);

  const updateProject = (slug, form) => $axios.$patch(`/projects/${slug}`, form);

  const deleteProject = (slug) => $axios.$delete(`/projects/${slug}`);

  return {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
  };
};
