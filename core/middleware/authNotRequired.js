const authNotRequired = ({ store, redirect }) => {
  // Use context
  // If the user is authenticated, redirect to home page
  // This is especially made for /login
  if (store.state.auth) {
    return redirect('/');
  }
};

export default authNotRequired;
