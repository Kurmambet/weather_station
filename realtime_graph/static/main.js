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
