export function isEquivalent(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function deepClone(object) {
  return JSON.parse(JSON.stringify(object));
}

export const calcGpsDistance = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // km
  var dLat = numericToRadian(lat2 - lat1);
  var dLon = numericToRadian(lon2 - lon1);
  lat1 = numericToRadian(lat1);
  lat2 = numericToRadian(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

// Converts numeric degrees to radians
const numericToRadian = (value) => {
  return (value * Math.PI) / 180;
};
