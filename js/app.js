import '../css/app.scss';
import $ from "jquery";

let websocket;
let weather;
const $document = $(document);
const $responseTime = $document.find('.response-time');
const $cityName = $document.find('.city-name');
const $highTemp = $document.find('.high-temp');
const $lowTemp = $document.find('.low-temp');

function init() {
  // Open WebSockets connection
  websocket = new WebSocket('ws://echo.websocket.org/');

  websocket.onopen = () => {
    console.info('WebSocket connected');
    // Once opened use HTML5 GeoLocation to get current location
    navigator.geolocation.getCurrentPosition(getWeather);
  };
  websocket.onclose = () => {
    console.info('WebSocket disconnected');
  };
  websocket.onmessage = (e) => {
    console.info('Message took: ', e.timeStamp, ' milisecconds');
    console.info('Message was: ', e.data);
    $responseTime.text(Math.round(e.timeStamp/1000));
  };
}

function getWeather(position) {
  // This function is called the by the form, or when current location is received
  fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=54c55f2df642a52192aa495ccf01198e`)
    .then(response => response.json())
    .then(response => {
      weather = response.main;
      console.info('Weather: ', weather);

      $highTemp.text(weather.temp_max);
      $lowTemp.text(weather.temp_min);
      $cityName.text(response.name);

      webSocketsSendMessage(weather.temp_max);
    });
}

function webSocketsSendMessage(weather) {
  websocket.send(weather);
}

init();