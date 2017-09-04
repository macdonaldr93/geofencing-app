import {connect} from 'react-firebase';
import React, {Component} from 'react';
import Moment from 'react-moment';
import PropTypes from 'prop-types';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import {firebaseConfig, googleMapURL} from '../helpers/config';
import Map from '../components/Map';
import '../styles/Map.css';

class Home extends Component {
  state = {
    center: {
      // CN Tower default
      lat: 43.642558,
      lng: -79.387046,
    },
    content: 'Getting position...',
    checkedOnce: false,
    insideFence: false,
    fence: null,
    lastFetched: null,
    fences: {},
    checkingInsideFence: false,
  };

  doneDrawing = (polygon) => {
    const vertices = polygon.getPath();
    const paths = [];

    for (let i = 0; i < vertices.getLength(); i++) {
      const xy = vertices.getAt(i);
      paths.push({
        lat: xy.lat(),
        lng: xy.lng(),
      });
    }

    this.props.addFence({
      paths,
      createdAt: Date.now(),
    });
  };

  checkGeofence = () => {
    if (!this.state.center.lat || !this.state.center.lng) {
      return;
    }

    const fetchOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        latitude: this.state.center.lat,
        longitude: this.state.center.lng,
      }),
    };

    this.setState({
      checkingInsideFence: true,
    });

    fetch(`${firebaseConfig.functionsURL}/checkGeofence`, fetchOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        throw new Error('Network response was not ok.');
      })
      .then((json) => {
        this.setState({
          insideFence: json.message,
          checkingInsideFence: false,
        });

        if (!this.checkedOnce) {
          this.setState({
            checkedOnce: true,
          });
        }

        return json.message;
      })
      .catch((err) => {
        // eslint-disable-next-line
        console.error(err);
        this.setState({
          checkingInsideFence: false,
        });
      });
  };

  getLocation = (position) => {
    this.setState({
      center: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      content: 'Location found.',
      lastFetched: position.timestamp,
    });
  };

  componentDidMount() {
    this.watchLocation();
  }

  componentWillUnmount() {
    this.unwatchLocation();
  }

  watchLocation() {
    if (!('geolocation' in navigator)) {
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 27000,
    };

    this.watchId = navigator.geolocation.watchPosition(this.getLocation, null, geoOptions);
  }

  unwatchLocation() {
    if ('geolocation' in navigator && this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  render() {
    let map = null;
    let fenceStatus = null;

    if (this.state.checkedOnce) {
      if (this.state.insideFence) {
        fenceStatus = <Typography gutterBottom>You are inside the fence.</Typography>;
      } else {
        fenceStatus = <Typography gutterBottom>You are outside the fence.</Typography>;
      }
    }

    if (this.state.lastFetched) {
      map = (<div>
        <Map
          googleMapURL={googleMapURL}
          loadingElement={
            <Typography>Loading maps...</Typography>
          }
          containerElement={
            <div className="Map-container" />
          }
          mapElement={
            <div className="Map" />
          }
          fences={this.props.fences}
          center={this.state.center}
          content={this.state.content}
          doneDrawing={this.doneDrawing}
        />
        <Typography type="subheading" gutterBottom>
          Last fetched: <Moment interval={10000} fromNow>{this.state.lastFetched}</Moment>
        </Typography>
        {fenceStatus}
        <Button
          color="primary"
          onClick={this.checkGeofence}
          disabled={this.state.checkingInsideFence}
        >
          Check fence
        </Button>
      </div>);
    } else {
      map = <Typography type="subheading" gutterBottom>Getting location...</Typography>;
    }

    return (
      <div className="text-center">
        {map}
      </div>
    );
  }
}

Home.propTypes = {
  fences: PropTypes.object,
  addFence: PropTypes.func,
};

function mapFirebaseToProps(props, ref) {
  return {
    fences: 'fences',
    addFence: (fence) => ref('fences').push(fence),
  };
}

export default connect(mapFirebaseToProps)(Home);
