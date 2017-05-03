'use strict';

/* global console */

import '../css/app.scss';
import $ from 'jquery';
import weatherIcons from './weatherIconsTemplates';

$(() => {

  let websocket;
  const $document = $(document);
  const $loader = $document.find('.weather-container__loader');
  const $citySearchForm = $document.find('.city-search');
  const $citySearchFormInput = $document.find('.city-search__input');
  const $dataContainer = $document.find('.data-container');
  const $dataContainerIcon = $document.find('.data-container__icon');
  const $websocketMessage = $document.find('.websocket-mesage');
  const $responseTime = $document.find('.response-time');
  const $cityName = $document.find('.city-name');
  const $highTemp = $document.find('.high-temp');
  const $lowTemp = $document.find('.low-temp');

  let latency;
  let latencyIn;
  let latencyOut;

  function init() {
    // Hide Data Container and Search Form
    $dataContainer.hide();
    $citySearchForm.hide();
    $websocketMessage.hide();

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
      latencyOut = Date.now();
      latency = (latencyOut - latencyIn) / 1000;

      console.info('Message took: ', e.timeStamp, ' milisecconds');
      console.info('Message latency: ', (latencyOut - latencyIn) / 1000);
      console.info('Message was: ', e.data);

      $websocketMessage.fadeIn(200);
      $responseTime.text(latency);
    };
  }

  function formSubmit(city) {
    // Hide Data Container
    $websocketMessage.fadeOut(200);
    $dataContainer.fadeOut(200);

    // This function is called the by the form
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=54c55f2df642a52192aa495ccf01198e`)
      .then(response => response.json())
      .then(response => doWithWeather(response));
  }

  function getWeather(position) {
    // Show form
    $loader.hide();
    $citySearchForm.fadeIn(200);

    // This function is called when current location is received
    fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=54c55f2df642a52192aa495ccf01198e`)
      .then(response => response.json())
      .then(response => doWithWeather(response));
  }

  function doWithWeather(response) {
    const weatherDescription = response.weather[0].description;
    let iconClass;

    // Show Data Container
    $dataContainer.fadeIn(200);

    console.info('Weather: ', response.main);

    if (weatherDescription == 'clear sky') {
      _switchIcon(weatherIcons.sunny);
    } else if (weatherDescription == 'mist') {
      _switchIcon(weatherIcons.cloudy);
    } else if (weatherDescription.indexOf('thunderstorm') !== -1) {
      _switchIcon(weatherIcons.thunderStorm);
    } else if (weatherDescription.indexOf('snow') !== -1 || weatherDescription.indexOf('sleet') !== -1) {
      _switchIcon(weatherIcons.flurries);
    } else if (weatherDescription.indexOf('clouds') !== -1) {
      _switchIcon(weatherIcons.cloudy);
    } else if (weatherDescription.indexOf('rain') !== -1 || weatherDescription.indexOf('drizzle') !== -1) {
      _switchIcon(weatherIcons.rainy);
    } else {
      _switchIcon(weatherIcons.sunny);
    }

    $highTemp.text(response.main.temp_max);
    $lowTemp.text(response.main.temp_min);
    $cityName.text(response.name);

    latencyIn = Date.now();
    webSocketsSendMessage(response.main.temp_max);
  }

  function _switchIcon(icon) {
    $dataContainerIcon.html(icon);
  }

  function webSocketsSendMessage(weather) {
    websocket.send(weather);
  }

  init();

  $citySearchForm.submit((e) => {
    e.preventDefault();
    formSubmit($citySearchFormInput.val());
  });

});