'use strict';

/* global console */

import '../css/app.scss';
import $ from "jquery";

$(() => {

  let websocket;
  const $document = $(document);
  const $citySearchForm = $document.find('.city-search');
  const $citySearchFormInput = $document.find('.city-search__input');
  const $dataContainer = $document.find('.data-container');
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

      $responseTime.text(latency);
    };
  }

  function formSubmit(city) {
    // Hide Data Container
    $dataContainer.hide();

    // This function is called the by the form
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=54c55f2df642a52192aa495ccf01198e`)
      .then(response => response.json())
      .then(response => doWithWeather(response));
  }

  function getWeather(position) {
    // Show form
    $citySearchForm.show();

    // This function is called when current location is received
    fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=54c55f2df642a52192aa495ccf01198e`)
      .then(response => response.json())
      .then(response => doWithWeather(response));
  }

  function doWithWeather(response) {
    // Show Data Container
    $dataContainer.show();

    console.info('Weather: ', response.main);

    $highTemp.text(response.main.temp_max);
    $lowTemp.text(response.main.temp_min);
    $cityName.text(response.name);

    latencyIn = Date.now();
    webSocketsSendMessage(response.main.temp_max);
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