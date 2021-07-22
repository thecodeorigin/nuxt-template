// Pass context from Vue component or Vuex
// const context = useContext();
// const { getProjects } = useProjectService(context);
export const useProjectService = ({ $clientApi, $authApi }) => {
  const endpoint = '/projects';

  const getProjects = () => $clientApi.$get(endpoint);

  const getProject = (slug) => $clientApi.$get(`${endpoint}/${slug}`);

  const createProject = (form) => $authApi.$post(endpoint, form);

  const updateProject = (slug, form) => $authApi.$patch(`${endpoint}/${slug}`, form);

  const deleteProject = (slug) => $authApi.$delete(`${endpoint}/${slug}`);

  return {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
  };
};
