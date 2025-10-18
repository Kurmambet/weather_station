// const data = {{ data|safe }};  // <-- данные из Django

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
            scales: {
                x: { title: { display: true, text: 'Время' } },
                y: { beginAtZero: false }
            }
        }
    });
};

const tempChart = createChart('tempChart', 'Температура', 'rgb(255, 99, 132)');
const humChart = createChart('humChart', 'Влажность', 'rgb(54, 162, 235)');
const presChart = createChart('presChart', 'Давление', 'rgb(255, 206, 86)');

data.forEach(d => {
    const timeLabel = new Date(d.timestamp).toLocaleString();
    tempChart.data.labels.push(timeLabel);
    tempChart.data.datasets[0].data.push(d.temperature);

    humChart.data.labels.push(timeLabel);
    humChart.data.datasets[0].data.push(d.humidity);

    presChart.data.labels.push(timeLabel);
    presChart.data.datasets[0].data.push(d.pressure);
});

tempChart.update();
humChart.update();
presChart.update();
