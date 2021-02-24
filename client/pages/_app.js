import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

// Overwriting the default app component. This will load in the other page components
// This is not a page!
const AppComponent = ({ Component, childProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...childProps} />
      </div>
    </div>
  );
};

// Because this is not a page, we get different args here
// If we call getInitialProps, it will no longer be automatically called in the page components! (workaround: call it manually in this method)
AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');
  
  let childProps = {};
  if (appContext.Component.getInitialProps) {
    childProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser,
    );
  }
  
  return {
    childProps,
    currentUser: data.currentUser
  }
};

export default AppComponent;