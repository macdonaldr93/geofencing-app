import React from 'react';
import firebase from 'firebase';
import PropTypes from 'prop-types';
import {Route, Redirect} from 'react-router-dom';

function PrivateRoute({component: Component, ...rest}) {

  function protectedComponent(props) {
    const isSignedIn = firebase.auth().currentUser;

    return (
      isSignedIn ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: {from: props.location},
          }}
        />
      )
    );
  }

  return (
    <Route
      {...rest}
      render={protectedComponent}
    />
  );
}

PrivateRoute.propTypes = {
  component: PropTypes.func,
  location: PropTypes.string,
};

export default PrivateRoute;
