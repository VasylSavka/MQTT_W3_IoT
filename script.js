const client = mqtt.connect('wss://test.mosquitto.org:8081');

client.on('connect', () => {
    console.log('Підключено до брокера');
    client.subscribe('tSensor/temperature');
    client.subscribe('hSensor/humidity');
    client.subscribe('pSensor/pressure');
});

let temperatureData = [];
let humidityData = [];
let pressureData = [];

function getCurrentTime() {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
}

function createChart(data, selector, color, yDomain = [0, 100]) {
    const width = 230;
    const height = 170;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const maxTicks = 5;

    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3.scalePoint()
        .domain(data.map(d => d.time))
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain(yDomain)
        .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale).ticks(maxTicks);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .attr("class", "x-axis")
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .attr("class", "y-axis")
        .call(yAxis);

    const line = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

    const path = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("d", line);

    return function updateChart(newValue) {
        const currentTime = getCurrentTime();
        
        data.push({ time: currentTime, value: newValue });

        if (data.length > maxTicks) {
            data.shift();
        }

        xScale.domain(data.map(d => d.time));

        svg.select(".x-axis").call(xAxis);
        svg.select(".y-axis").call(yAxis);

        path.datum(data)
            .attr("d", line);
    };
}

const updateTemperatureChart = createChart(temperatureData, '.temperature-graph-card .date-info', 'red', [0, 50]);
const updateHumidityChart = createChart(humidityData, '.humidity-graph-card .date-info', 'blue', [0, 100]);
const updatePressureChart = createChart(pressureData, '.pressure-graph-card .date-info', 'green', [900, 1100]);

client.on('message', (topic, message) => {
    const value = parseFloat(message.toString());

    if (topic === 'tSensor/temperature') {
        document.querySelector('.temperature').innerHTML = `${value}°C`;
        updateTemperatureChart(value);
    } else if (topic === 'hSensor/humidity') {
        document.querySelector('.humidity').innerHTML = `${value}%`;
        updateHumidityChart(value);
    } else if (topic === 'pSensor/pressure') {
        document.querySelector('.pressure').innerHTML = `${value}hPa`;
        updatePressureChart(value);
    }
});
