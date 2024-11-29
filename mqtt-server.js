const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://test.mosquitto.org');

function getRandomTemperature() {
    return (Math.random() * (30 - 20) + 20).toFixed(2);
}

function getRandomHumidity() {
    return (Math.random() * (100 - 30) + 30).toFixed(2);
}

function getRandomPressure() {
    return (Math.random() * (1025 - 1000) + 1000).toFixed(2);
}

client.on('connect', () => {
    
    setInterval(() => {
        const temperature = getRandomTemperature();
        const humidity = getRandomHumidity();
        const pressure = getRandomPressure();

        client.publish('tSensor/temperature', temperature);
        client.publish('hSensor/humidity', humidity);
        client.publish('pSensor/pressure', pressure);

    }, 5000);
});
