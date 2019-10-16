export const addLocation = (lat, lon) => (state) => ({ location : {latitude: lat, longitude: lon} })

export const addData = (responseJson) => (state) => ({loading: false, dataSource: responseJson})

export const sortedData = (newState) => ({dataSource: newState}, function() {
    let newData = this.state.dataSource;
    newData.sort(function(a,b){
      return parseInt(a.distance)  - parseInt(b.distance);
     })
  })

export const changeGeo = (state) => ({geo: !state})