<template>
  <div class="dashboard-container">
    <h1>Dashboard Admin</h1>

    <div class="cards-grid">
      <div class="card">
        <h3>Usuarios registrados</h3>
        <p>1,245</p>
      </div>
      <div class="card">
        <h3>Vehículos registrados</h3>
        <p>3,876</p>
      </div>
      <div class="card">
        <h3>Vehículos afectados</h3>
        <p>532</p>
      </div>
      <div class="card">
        <h3>Último registro</h3>
        <p>12/02/2026</p>
      </div>
    </div>

    <div class="chart-section">
      <h2>Vehículos registrados por mes</h2>
      <div class="chart-placeholder">
        <!-- Aquí podrías poner un gráfico real más tarde -->
        <p>📊 Gráfico de ejemplo</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  text-align: center;
  color: #003b6f;
  margin-bottom: 2rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.12);
}

.card h3 {
  color: #0077be;
  margin-bottom: 0.8rem;
}

.card p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #003b6f;
}

.chart-section {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  text-align: center;
}

.chart-section h2 {
  color: #0077be;
  margin-bottom: 1.5rem;
}

.chart-placeholder {
  background: #f0f7ff;
  padding: 3rem;
  border-radius: 15px;
  color: #003b6f;
  font-size: 1.2rem;
  font-weight: 600;
}
</style>