import * as React from 'react';
import { Button, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, ScrollView, StyleSheet,Fragment } from 'react-native';
// import { connect, createStore } from 'react-redux';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { StackNavigator } from 'react-navigation'

// const initState = {
//   todos: [],
//   posts:[]
// }

// function myreducer( state = initState, action) {
//   console.log(action, state);
// }

// const store = createStore(myreducer);

// const todoAction = { type: 'ADD_TODO', todo: "milk"}

// store.dispatch(todoAction);

const styles = StyleSheet.create({
  item: {
    flex: 1,
    flexDirection: 'row',
    padding: 6,
    backgroundColor: '#040404',
    fontWeight: 'bold',
    alignSelf: 'stretch',
  },
  wellcomeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
  },
  textAddress: {
    color: '#fff',
    textAlign: 'right',
    alignSelf: 'stretch',
    fontWeight: 'bold',
    fontSize: 12,
  },
  textKm: {
    justifyContent: 'flex-end',
    color: '#428bca',
    textAlign: 'right',
    alignSelf: 'stretch',
    fontWeight: 'bold',
    fontSize: 12,
  }
});


getHaversineDistance = (firstLocation, secondLocation) => {
  const earthRadius = 6371; // km 
  const diffLat = (secondLocation.lat-firstLocation.lat) * Math.PI / 180;  
  const diffLng = (secondLocation.lng-firstLocation.lng) * Math.PI / 180;  
  const arc = Math.cos(
                  firstLocation.lat * Math.PI / 180) * Math.cos(secondLocation.lat * Math.PI / 180) 
                  * Math.sin(diffLng/2) * Math.sin(diffLng/2)
                  + Math.sin(diffLat/2) * Math.sin(diffLat/2);
  const line = 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1-arc));
  const distance = earthRadius * line; 
  return distance.toFixed(0);
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    headerStyle: {
      backgroundColor: '#040404',
    }
  }
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: "#040404" }}>
        <Text style={[styles.wellcomeText]} >Hello world</Text>
        <Button 
          title="Continue"
          onPress={() => this.props.navigation.navigate('Continue')}
        /> 
        </View>
    );
}}

class ContinueScreen extends React.Component {
  static navigationOptions = {
    headerStyle: {
      backgroundColor: '#040404',
    },headerTintColor: '#fff',
  }
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      dataSource:[],
      location: [],
      geo: false
     };
    }

    ingnoreGeo = () => {
      console.log("geo message")
    }

    getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords['latitude'];
          const lon = position.coords['longitude'];
          this.setState({ location : {
            latitude: lat,
            longitude: lon
        } });
        },
        error => Alert.alert(error.message),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    }

    getData = () => {
      fetch('https://warply.s3.amazonaws.com/data/test_pois.json')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          loading: false,
          dataSource: responseJson
         })
         let newState = this.state.dataSource;
         const deviceLocation = { lat: this.state.location.latitude, lng: this.state.location.longitude }
         newState.forEach(function(data) {
           const secondLocation = { lat: data.latitude, lng: data.longitude }
           data.distance = getHaversineDistance(deviceLocation, secondLocation)
          })
          this.setState({dataSource: newState}, function() {
            let newData = this.state.dataSource;
            newData.sort(function(a,b){
              return parseInt(a.distance)  - parseInt(b.distance);
             })
          })
       })
      .catch((error) =>{
        console.error(error);
      });
    }

  componentDidMount() {
    setTimeout(() => {
      this.getData();
    }, 200);
    this.getLocation();
  }

  renderItem=(data)=>
  <TouchableOpacity >
    <View style={[styles.item]}>
      <Text style={styles.textAddress} >{data.item.address } </Text> 
      <Text style={styles.textKm} >{data.item.distance} km</Text> 
    </View>
  </TouchableOpacity>
  render() {
      if(this.state.loading){
        return(
        <ScrollView style={{flex: 1}}>
          <ActivityIndicator/>
        </ScrollView>
      )}

      const IsNum = (poi) => {
        if (Number(poi.longitude !== undefined)){
          // console.log(typeof(Number(poi.latitude)), poi.address);
          return(<Marker coordinate={{ latitude: Number(poi.latitude),longitude: Number(poi.longitude)}} pinColor={'wheat'} title={poi.address} key={poi.id}/>)
        }
      }
      
      return(
      <ScrollView style={{flex: 1}}>
       <FlatList
          data= {this.state.dataSource}
          ItemSeparatorComponent = {this.FlatListItemSeparator}
          renderItem= {item=> this.renderItem(item)}
          keyExtractor= {item=>item.id.toString()}
       />
        <MapView style={{width: 500, height: 500}} initialRegion={{latitude: this.state.location.latitude, longitude: this.state.location.longitude, latitudeDelta: 4.5, longitudeDelta: 5.5}} >
        <Marker coordinate={{latitude: this.state.location.latitude,longitude: this.state.location.longitude}} pinColor={'red'} title='Your location' cluster={false}/> 
        {this.state.dataSource.map(poi => (
          IsNum(poi)
        ))}
        </MapView>
      </ScrollView>
    );
  }
}

// initialRegion={{ latitude: this.state.location.lat, longitude: this.state.location.lon, latitudeDelta: 0.0922, longitudeDelta: 0.0421}} initialRegion={{latitude: this.state.location.latitude, longitude: this.state.location.longitude, latitudeDelta: 8.5, longitudeDelta: 0.5}}
const RootStack = createStackNavigator({
  Home: HomeScreen,
  Continue: ContinueScreen,
});

export default createAppContainer(RootStack);