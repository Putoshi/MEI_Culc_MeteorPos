'use strict';

module.exports.meteorpos = (event, context, callback) => {


  const vincentry = require('./Vincentry');
  const Config = require('./Config');

  const lat = Config.OBSERVATION_POINT.latitude;
  const lng = Config.OBSERVATION_POINT.longitude;
  // const azimuth = 10;
  // const elevation = 40;

  let azimuth = event.queryStringParameters.azimuth;
  let elevation = event.queryStringParameters.elevation;


  let distance = Math.round(90 / Math.tan(vincentry.doRad(elevation)));
  let result = vincentry.calc(lat, lng, azimuth, distance);
  console.log("距離: " + distance);
  console.log("緯度: " + result[0]);
  console.log("経度: " + result[1]);

  const API_KEY = Config.GOOGLE_APIS_KEY;
  const URL_GM = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
  let url = URL_GM + result[0] + "," + result[1] + "&language=ja&key=" + API_KEY;


  let parser_results = (dict_aa) => {
    const unit_out = {};
    unit_out['city'] = "該当なし";
    unit_out['pref'] = "該当なし";
    unit_out['azimuth'] = azimuth;
    unit_out['elevation'] = elevation;
    unit_out['lat'] = result[0];
    unit_out['lng'] = result[1];
    unit_out['distance'] = distance;

    try {
      const components = dict_aa['results'][0]['address_components'];
      // console.log(components);
      for (let it in components) {
        const unit_aa = components[it];
        if (unit_aa['types'][0] == "locality") {
          unit_out.city = unit_aa['short_name']
        }
        else if (unit_aa['types'][0] == "administrative_area_level_1") {
          unit_out.pref = unit_aa['short_name']
        }
      }


    } catch (e) {

    }
    return unit_out;
  };

  let resBody = {};

  const getCity = () => {
    const Client = require('node-rest-client').Client;
    const client = new Client();

    client.get(url, function (data, response) {
      const unit = parser_results(data);

      resBody = {
        statusCode: 200,
        body: JSON.stringify({
          unit: unit,
          message: 'Dev     ' + 'azimuth: ' + azimuth + '  elevation: ' + elevation + ' ----- ' + unit.pref + ' : ' + unit.city,
          input: event,
        }),
      };

      if (event.requestContext.stage) {
        if (event.requestContext.stage == 'production') {
          resBody = {
            statusCode: 200,
            body: JSON.stringify({
              unit: unit,
              message: 'Production     ' + 'azimuth: ' + azimuth + '  elevation: ' + elevation + ' ----- ' + unit.pref + ' : ' + unit.city
            }),
          };
        }
      }

      loadJson(unit);

    });
  };

  getCity();


  // S3 Save json
  const aws = require('aws-sdk');
  aws.config.region = Config.S3.REGION;
  const bucket = Config.S3.BUCKET;
  const s3 = new aws.S3();
  let key = 'storage/mei_dev.json';
  if (event.requestContext.stage) {
    if (event.requestContext.stage == 'production') {
      key = 'storage/mei.json';
    }
  }

  const loadJson = (_unit) => {

    s3.getObject({
      Bucket: bucket,
      Key: key
    }, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        console.log(err, err.stack);
        resBody.body = "loadJson err " + err;
        callback(null, resBody);
        context.done();
      } else {
        const object = JSON.parse(data.Body.toString());
        saveJson(object, _unit);
      }
    });
  };

  const saveJson = (obj, _unit) => {
    const dateStr = formatDate(new Date(), 'yyyyMMdd');

    // すでにある場合
    if(!obj.daily_report[dateStr]) {
      obj.daily_report[dateStr] = [];
    }

    const d = new Date();
    d.setTime(d.getTime() + 32400000);

    let newData = {
      "time": formatDate(d, 'yyyy/MM/dd_HH:mm:ss'),
      "unit": _unit
    };

    obj.daily_report[dateStr].push(newData);


    s3.putObject({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(obj)
    }, (err, data) => {

      if (err) {
        console.log(err, err.stack);
        resBody.body = "saveJson err " + err;
        callback(null, resBody);
        context.done();
      } else {

        resBody.body = JSON.stringify(newData);

        callback(null, resBody);
        context.done();
      }


    });
  };


  const formatDate = (date, format) =>
  {
    format = format.replace(/yyyy/g, date.getFullYear());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
    return format;
  };


};



