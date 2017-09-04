import React, {Component} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
} from 'react-router-dom';
import firebase from 'firebase';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Home from './pages/Home';
import Login from './pages/Login';
import './styles/navbar.css';

class App extends Component {
  state = {
    currentUser: null,
  };

  renderLogin = () => {
    return <Login currentUser={this.state.currentUser} />;
  };

  logout = () => {
    firebase.auth().signOut();

    this.setState({
      currentUser: null,
    });
  };

  componentDidMount() {
    firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          currentUser: user,
        });
      } else {
        this.setState({
          currentUser: null,
        });
      }
    });
  }

  render() {
    return (
      <Router>
        <div>
          <AppBar position="static">
            <Toolbar className="navbar">
              <Typography type="title" color="inherit">
                Geofencing
              </Typography>
              <div className="navbar__menu-items">
                <Button color="contrast" to="/" component={Link}>Home</Button>
                {this.state.currentUser ? (
                  <Button color="contrast" onClick={this.logout}>Logout</Button>
                ) : (
                  <Button color="contrast" to="/login" component={Link}>Login</Button>
                )}
              </div>
            </Toolbar>
          </AppBar>

          <Route exact path="/" component={Home} />
          <Route path="/login" render={this.renderLogin} />
        </div>
      </Router>
    );
  }
}

export default App;
