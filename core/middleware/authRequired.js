const authRequired = ({ store, redirect }) => {
  // Use context
  // If the user is not authenticated
  if (!store.state.auth) {
    redirect('/login');
  }
};

export default authRequired;
