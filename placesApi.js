export function fetchPlacePredictions(input) {
  return new Promise((resolve, reject) => {
    const service = new google.maps.places.AutocompleteService();

    service.getPlacePredictions({ input }, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(predictions);
      } else {
        reject('Autocomplete failed: ' + status);
      }
    });
  });
}

export function getCoordinatesForPlace(placeName) {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: placeName }, (results, status) => {
      if (status === "OK" && results[0]) {
        resolve(results[0].geometry.location.toJSON()); // { lat: ..., lng: ... }
      } else {
        reject("Geocode failed: " + status);
      }
    });
  });
}

export function fetchNearbyAttractions(lat, lng) {
  return new Promise((resolve, reject) => {
    const location = new google.maps.LatLng(lat, lng);
    const service = new google.maps.places.PlacesService(document.createElement("div"));

    const types = ["tourist_attraction", "museum", "park"];
    const allResults = [];

    let completed = 0;

    types.forEach((type) => {
      service.nearbySearch(
        {
          location,
          radius: 5000,
          type,
        },
        (results, status) => {
          completed++;
          if (status === google.maps.places.PlacesServiceStatus.OK && results.length) {
            allResults.push(
              ...results.map((place) => ({
                name: place.name,
                address: place.vicinity || "",
                type,
              }))
            );
          }

          if (completed === types.length) {
            resolve(allResults.slice(0, 6));
          }
        }
      );
    });
  });
}
