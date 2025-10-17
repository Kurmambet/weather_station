// /graph/realtime_graph/static/main.js
// let ctx = document.querySelector('#myChart');

// let graphData = {
//     type: 'line',
//     data: {
//         labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//         datasets: [{
//             label: 'My First Dataset',
//             data: [65, 59, 80, 81, 56, 55, 40],
//             fill: false,
//             borderColor: 'rgb(75, 192, 192)',
//             tension: 0.1
//         }]
//     },
// }

// let myChart = new Chart(ctx, graphData)

// const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
// const socket = new WebSocket(`${wsScheme}://${window.location.host}/ws/graph/`);

// socket.onmessage = function(e) {
//     let djangoData = JSON.parse(e.data);
//     console.log(djangoData);
    
//     let newGraphData = graphData.data.datasets[0].data;
//     let newLabels = graphData.data.labels;

//     newGraphData.shift();
//     newLabels.shift();

//     newGraphData.push(djangoData.value);
//     newLabels.push(djangoData.day);

//     graphData.data.datasets[0].data = newGraphData;
//     graphData.data.labels = newLabels;

//     myChart.update();
// }







// let ctx = document.querySelector('#myChart');

// let graphData = {
//     type: 'line',
//     data: {
//         labels: [],
//         datasets: [
//             {
//                 label: 'Temperature (°C)',
//                 data: [],
//                 borderColor: 'rgb(255, 99, 132)',
//                 fill: false,
//                 tension: 0.1
//             },
//             {
//                 label: 'Humidity (%)',
//                 data: [],
//                 borderColor: 'rgb(54, 162, 235)',
//                 fill: false,
//                 tension: 0.1
//             },
//             {
//                 label: 'Pressure (hPa)',
//                 data: [],
//                 borderColor: 'rgb(75, 192, 192)',
//                 fill: false,
//                 tension: 0.1
//             }
//         ]
//     }
// };

// let myChart = new Chart(ctx, graphData);

// const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
// const socket = new WebSocket(`${wsScheme}://${window.location.host}/ws/graph/`);

// socket.onmessage = function(e) {
//     let djangoData = JSON.parse(e.data);
//     console.log("Incoming:", djangoData);

//     const { temperature, humidity, pressure, timestamp } = djangoData;

//     graphData.data.labels.push(timestamp);
//     if (graphData.data.labels.length > 20) graphData.data.labels.shift();

//     graphData.data.datasets[0].data.push(temperature);
//     graphData.data.datasets[1].data.push(humidity);
//     graphData.data.datasets[2].data.push(pressure);

//     graphData.data.datasets.forEach(ds => {
//         if (ds.data.length > 20) ds.data.shift();
//     });

//     myChart.update();
// };



// --- Инициализация трех графиков ---
const createChart = (ctxId, label, color) => {
    const ctx = document.getElementById(ctxId);
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: color,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            animation: false,
            scales: {
                x: {
                    title: { display: true, text: 'Время' }
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
};

const tempChart = createChart('tempChart', 'Температура', 'rgb(255, 99, 132)');
const humChart = createChart('humChart', 'Влажность', 'rgb(54, 162, 235)');
const presChart = createChart('presChart', 'Давление', 'rgb(255, 206, 86)');

// --- WebSocket подключение ---
const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
const socket = new WebSocket(`${wsScheme}://${window.location.host}/ws/graph/`);

// --- Обновление графиков ---
socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log("Получено:", data);

    const timeLabel = new Date().toLocaleTimeString();

    const updateChart = (chart, value) => {
        chart.data.labels.push(timeLabel);
        chart.data.datasets[0].data.push(value);

        if (chart.data.labels.length > 30) { // ограничим до 30 точек
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update();
    };

    updateChart(tempChart, data.temperature);
    updateChart(humChart, data.humidity);
    updateChart(presChart, data.pressure);
};
