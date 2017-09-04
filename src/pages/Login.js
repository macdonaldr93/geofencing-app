import React, {Component} from 'react';
import {Redirect, withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import AuthForm from '../components/AuthForm';

class Login extends Component {
  state = {
    redirectToReferrer: false,
  };

  login = (currentUser) => {
    this.setState({currentUser, redirectToReferrer: true});
    this.props.history.push('/');
  };

  render() {
    const {from} = this.props.location.state || {
      from: {
        pathname: '/',
      },
    };
    const {redirectToReferrer} = this.state;

    if (redirectToReferrer) {
      return (<Redirect to={from} />);
    }

    if (this.props.currentUser) {
      return (<Redirect to={from} />);
    }

    return (
      <div className="text-center">
        {from.pathname &&
          <p>You must log in to view the page at {from.pathname}</p>
        }
        <AuthForm login={this.login} />
      </div>
    );
  }
}

Login.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      from: PropTypes.shape({
        pathname: PropTypes.string,
      }),
    }),
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  currentUser: PropTypes.object,
};

export default withRouter(Login);
