import React, {Component} from 'react';
import firebase from 'firebase';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Input from 'material-ui/Input';
import InputLabel from 'material-ui/Input/InputLabel';
import FormControl from 'material-ui/Form/FormControl';
import FormHelperText from 'material-ui/Form/FormHelperText';
import {authWithPhoneNumber, verifyConfirmationCode} from '../helpers/auth';

class AuthForm extends Component {
  state = {
    phoneNumber: '',
    code: '',
    confirming: false,
    recaptcha: false,
    currentUser: null,
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  handlePhoneNumberSubmit = () => {
    if (!this.state.phoneNumber) {
      return;
    }

    this.setState({confirming: true});
    authWithPhoneNumber(this.state.phoneNumber, this.verifier)
      .catch(() => {
        this.setState({confirming: false});
      });
  };

  handleCodeSubmit = () => {
    if (!this.state.code) {
      return;
    }

    verifyConfirmationCode(this.state.code)
      .then((response) => {
        return this.props.login(response.user);
      })
      .catch((err) => {
        // eslint-disable-next-line
        console.error(err);
      });
  };

  componentDidMount() {
    firebase.auth().useDeviceLanguage();

    this.verifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
      size: 'invisible',
      callback: () => {
        this.setState({
          recaptcha: true,
        });
      },
    });
  }

  render() {
    return (
      <div>
        {this.state.confirming ? (
          <FormControl>
            <InputLabel htmlFor="Auth-Confirmation-Code">Confirmation code</InputLabel>
            <Input id="Auth-Confirmation-Code" name="code" value={this.state.code} onChange={this.handleInputChange} />
            <Button onClick={this.handleCodeSubmit}>Confirm</Button>
          </FormControl>
        ) : (
          <FormControl>
            <InputLabel htmlFor="Auth-Phone-Number">Phone number</InputLabel>
            <Input id="Auth-Phone-Number" name="phoneNumber" value={this.state.phoneNumber} onChange={this.handleInputChange} />
            <FormHelperText>+1 111-111-1111</FormHelperText>
            <Button id="Auth-Phone-Submit" onClick={this.handlePhoneNumberSubmit}>Login</Button>
          </FormControl>
        )}
        {this.state.currentUser && this.state.currentUser.phoneNumber}
        <div id="recaptcha" />
      </div>
    );
  }
}

AuthForm.propTypes = {
  login: PropTypes.func,
};

export default AuthForm;
