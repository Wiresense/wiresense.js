<h1 align="center" id="title">Wiresense.JS</h1>

![wiresense.js](https://socialify.git.ci/Wiresense/wiresense.js/image?forks=1&issues=1&language=1&name=1&owner=1&pattern=Solid&pulls=1&stargazers=1&theme=Auto)

<p align="center">
    <img src="https://img.shields.io/badge/Made%20with%20Love%E2%9D%A4%EF%B8%8F-black?style=for-the-badge
    " alt="made with love">
    <img src="https://img.shields.io/badge/Typescript-ts?style=for-the-badge&amp;logo=typescript&amp;logoColor=white&amp;color=%233178C6" alt="typescript">
</p>

Client libary for Wiresense

## 🛠️Features

- Send data to the wiresense frontend
- Works with almost every sensor
- Automaticly saved data into csv files

## 📖Usage

Install the libary with npm:

```bash
  npm install @thedannicraft/wiresense
```

Import the libary and configure it

```js
const { Wiresense } = require('@thedannicraft/wiresense');

Wiresense.config({
    port: 8080
});
```

Setup a new sensor (group)

```js
function readSensor() {
    // Replace with you actual sensor reading logic
    return {
        Pressure: Math.random(),
        Humidity: Math.random(),
        Temperature: Math.random()
    };
}

const mySensor = new Wiresense('Fake-BME280', readSensorData, './data/sensor_data.csv');
```

Execute a sensor (Send to frontend and save to file)

```js
mySensor.execute();
```

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Authors

- [@thedannicraft](https://www.github.com/thedannicraft)
