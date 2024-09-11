document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('priceChart').getContext('2d');
    let priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Time values
            datasets: [{
                label: 'Commodity Price',
                data: [], // Price values
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute'
                    }
                }
            }
        }
    });

    // Modal controls
    const modal = document.getElementById('inputModal');
    const addDataBtn = document.getElementById('addDataBtn');
    const closeModal = document.getElementsByClassName('close')[0];

    addDataBtn.onclick = () => modal.style.display = 'block';
    closeModal.onclick = () => modal.style.display = 'none';
    window.onclick = event => {
        if (event.target === modal) modal.style.display = 'none';
    };

    // Handle form submit
    const form = document.getElementById('dataForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const price = document.getElementById('price').value;

        // Send data to backend
        await fetch('/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ price })
        });

        // Update chart (fetch new data)
        await updateChartData(priceChart);

        modal.style.display = 'none'; // Close modal after submitting
    });

    // Fetch data and update chart
    const updateChartData = async (chart) => {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        chart.data.labels = data.map(item => item.timestamp);
        chart.data.datasets[0].data = data.map(item => item.price);
        chart.update();
    };

    // Filter option
    const timeFilter = document.getElementById('timeFilter');
    timeFilter.addEventListener('change', async () => {
        const filterValue = timeFilter.value;
        const response = await fetch(`/api/data?filter=${filterValue}`);
        const data = await response.json();

        priceChart.data.labels = data.map(item => item.timestamp);
        priceChart.data.datasets[0].data = data.map(item => item.price);
        priceChart.update();
    });

    // Initial data load
    updateChartData(priceChart);
});