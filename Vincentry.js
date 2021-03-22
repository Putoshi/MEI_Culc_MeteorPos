const RADIUS_LONG = 6378137.0;
const HENPEI = 1 / 298.257222101;
const RADIUS_SHORT = RADIUS_LONG * (1 - HENPEI); // 6356752.314

module.exports = Vincentry = {

  doRad: (a) => {
    return a / 180 * Math.PI;
  },
  radDo: (a) => {
    return a * 180 / Math.PI;
  },
  xy: (x, y) => {
    return Math.pow(x, y);
  },
  calc: (lat1, lng1, alpha12, length) => {

    lat1 = Vincentry.doRad(lat1);
    lng1 = Vincentry.doRad(lng1);
    alpha12 = Vincentry.doRad(alpha12);
    length = length * 1000;

    let U1 = Math.atan((1 - HENPEI) * Math.tan(lat1));
    let sigma1 = Math.atan(Math.tan(U1) / Math.cos(alpha12));
    let alpha = Math.asin(Math.cos(U1) * Math.sin(alpha12));
    let u2 = Vincentry.xy(Math.cos(alpha), 2) * (Vincentry.xy(RADIUS_LONG, 2) - Vincentry.xy(RADIUS_SHORT, 2)) / Vincentry.xy(RADIUS_SHORT, 2);
    let A = 1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
    let B = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
    let sigma = length / RADIUS_SHORT / A;

    let sigma0;
    let dm2;

    do {
      sigma0 = sigma;
      dm2 = 2 * sigma1 + sigma;
      let x = Math.cos(sigma) * ( -1 + 2 * Vincentry.xy(Math.cos(dm2), 2) ) - B / 6 * Math.cos(dm2) * ( -3 + 4 * Vincentry.xy(Math.sin(dm2), 2)) * ( -3 + 4 * Vincentry.xy(Math.cos(dm2), 2));
      let dSigma = B * Math.sin(sigma) * ( Math.cos(dm2) + B / 4 * x);
      sigma = length / RADIUS_SHORT / A + dSigma;
    } while (Math.abs(sigma0 - sigma) > 1e-9);

    let x = Math.sin(U1) * Math.cos(sigma) + Math.cos(U1) * Math.sin(sigma) * Math.cos(alpha12)
    let y = (1 - HENPEI) * Vincentry.xy(Vincentry.xy(Math.sin(alpha), 2) + Vincentry.xy(Math.sin(U1) * Math.sin(sigma) - Math.cos(U1) * Math.cos(sigma) * Math.cos(alpha12), 2), 1 / 2);
    let lamda = Math.sin(sigma) * Math.sin(alpha12) / (Math.cos(U1) * Math.cos(sigma) - Math.sin(U1) * Math.sin(sigma) * Math.cos(alpha12));
    lamda = Math.atan(lamda);
    let C = (HENPEI / 16) * Vincentry.xy(Math.cos(alpha), 2) * (4 + HENPEI * (4 - 3 * Vincentry.xy(Math.cos(alpha), 2)));
    let z = Math.cos(dm2) + C * Math.cos(sigma) * (-1 + 2 * Vincentry.xy(Math.cos(dm2), 2) );
    let omega = lamda - (1 - C) * HENPEI * Math.sin(alpha) * (sigma + C * Math.sin(sigma) * z);
    return [Vincentry.radDo(Math.atan(x / y)), Vincentry.radDo(lng1 + omega)];

  }
};


