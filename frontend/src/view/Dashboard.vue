<template>
  <div class="dashboard-container">
    <h1>Dashboard Admin</h1>

    <div v-if="cargando" class="loading">Cargando estadísticas...</div>

    <div v-else class="cards-grid">
      <div class="card">
        <h3>Usuarios registrados</h3>
        <p>{{ stats.total_clientes ?? '—' }}</p>
      </div>
      <div class="card">
        <h3>Vehículos registrados</h3>
        <p>{{ stats.total_vehiculos ?? '—' }}</p>
      </div>
      <div class="card card-accepted">
        <h3>Vehículos aceptados</h3>
        <p>{{ stats.total_accepted ?? '—' }}</p>
      </div>
      <div class="card">
        <h3>Último registro</h3>
        <p>{{ ultimoRegistroFormateado }}</p>
      </div>
    </div>
    <!-- Sección de Incidencias Pendientes
    <div class="incidencias-section">
      <h2>Incidencias Pendientes para Admin</h2>
      <div v-if="cargandoIncidencias" class="loading">Cargando incidencias...</div>
      <div v-else-if="incidencias.length === 0" class="vacio">No hay incidencias pendientes</div>
      <div v-else class="incidencias-grid">
        <div v-for="inc in incidencias" :key="inc.id" class="incidencia-card">
          <h4>{{ inc.titulo }}</h4>
          <p><strong>ID:</strong> {{ inc.id }}</p>
          <p><strong>Cliente:</strong> {{ inc.cliente_id }}</p>
          <p><strong>Descripción:</strong> {{ inc.descripcion }}</p>
          <div class="button-group">
            <button @click="handleIncidenciaStatus(inc.id, 'accepted')" class="btn btn-accept" :disabled="procesandoIncidencia === inc.id">
              {{ procesandoIncidencia === inc.id ? 'Procesando...' : '✓ Aceptar' }}
            </button>
            <button @click="handleIncidenciaStatus(inc.id, 'rejected')" class="btn btn-reject" :disabled="procesandoIncidencia === inc.id">
              {{ procesandoIncidencia === inc.id ? 'Procesando...' : '✗ Rechazar' }}
            </button>
          </div>
          <div v-if="feedbackIncidencia[inc.id]" :class="['status-message', feedbackIncidencia[inc.id].type]">
            {{ feedbackIncidencia[inc.id].message }}
          </div>
        </div>
      </div>
    </div> -->

    <!-- Gestión de vehículos -->
    <div class="table-section">
      <div class="table-header">
        <h2>Gestión de vehículos</h2>
        <div class="filtros">
          <button
            v-for="f in filtros"
            :key="f.value"
            class="filtro-btn"
            :class="{ active: filtroActivo === f.value }"
            @click="cambiarFiltro(f.value)"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <div v-if="cargandoVehiculos" class="loading">Cargando vehículos...</div>

      <div v-else-if="vehiculos.length === 0" class="vacio">
        No hay vehículos con estado <strong>{{ filtroActivo }}</strong>.
      </div>

      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Matrícula</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Año</th>
              <th>Cliente ID</th>
              <th>Status</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in vehiculos" :key="v.id">
              <td>{{ v.id }}</td>
              <td>{{ v.matricula }}</td>
              <td>{{ v.marca }}</td>
              <td>{{ v.modelo }}</td>
              <td>{{ v.anio_matriculacion ?? '—' }}</td>
              <td>{{ v.cliente_id }}</td>
              <td>
                <span class="badge" :class="v.status">{{ v.status }}</span>
              </td>
              <td class="acciones">
                <button
                  v-if="v.status !== 'accepted'"
                  class="btn-accept"
                  :disabled="procesando === v.id"
                  @click="cambiarStatus(v, 'accepted')"
                >✔ Aceptar</button>
                <button
                  v-if="v.status !== 'rejected'"
                  class="btn-reject"
                  :disabled="procesando === v.id"
                  @click="cambiarStatus(v, 'rejected')"
                >✖ Rechazar</button>
                <button
                  v-if="v.status !== 'pending'"
                  class="btn-pending"
                  :disabled="procesando === v.id"
                  @click="cambiarStatus(v, 'pending')"
                >↺ Pendiente</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../services/api'

const cargando = ref(true)
const cargandoVehiculos = ref(false)
const cargandoIncidencias = ref(false)
const stats = ref({})
const vehiculos = ref([])
const incidencias = ref([])
const filtroActivo = ref('pending')
const procesando = ref(null)
const procesandoIncidencia = ref(null)
const feedbackIncidencia = ref({})
const adminEmail = ref('admin@cartel-coches.local')

const filtros = [
  { label: '⏳ Pendientes', value: 'pending' },
  { label: '✔ Aceptados',  value: 'accepted' },
  { label: '✖ Rechazados', value: 'rejected' },
  { label: '📋 Todos',     value: '' }
]

const ultimoRegistroFormateado = computed(() => {
  if (!stats.value.ultimo_registro) return '—'
  const d = new Date(stats.value.ultimo_registro)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
})

const cargarVehiculos = async (status) => {
  cargandoVehiculos.value = true
  try {
    const qs = status ? `?status=${status}` : ''
    vehiculos.value = await api.get(`/vehiculos${qs}`)
  } catch (e) {
    console.error('Error al cargar vehículos:', e)
    vehiculos.value = []
  } finally {
    cargandoVehiculos.value = false
  }
}

const cambiarFiltro = async (valor) => {
  filtroActivo.value = valor
  await cargarVehiculos(valor)
}

const mensajesIncidencia = {
  accepted: (v) => ({
    titulo: `Vehículo ${v.matricula} aceptado`,
    descripcion: `Su vehículo ${v.marca} ${v.modelo} (${v.matricula}) ha sido revisado y ACEPTADO en el programa de reclamación. Nos pondremos en contacto con usted próximamente para continuar con el proceso.`
  }),
  rejected: (v) => ({
    titulo: `Vehículo ${v.matricula} rechazado`,
    descripcion: `Su vehículo ${v.marca} ${v.modelo} (${v.matricula}) ha sido revisado y no cumple los requisitos para participar en el programa de reclamación. Si cree que es un error, contacte con nosotros.`
  }),
  pending: (v) => ({
    titulo: `Vehículo ${v.matricula} en revisión`,
    descripcion: `Su vehículo ${v.marca} ${v.modelo} (${v.matricula}) ha vuelto a estado pendiente de revisión.`
  })
}

const cambiarStatus = async (vehiculo, nuevoStatus) => {
  procesando.value = vehiculo.id
  try {
    const updated = await api.patch(`/vehiculos/${vehiculo.id}/status`, { status: nuevoStatus })

    // Crear incidencia notificando al cliente
    const { titulo, descripcion } = mensajesIncidencia[nuevoStatus](vehiculo)
    try {
     // 1️⃣ Crear incidencia
    const nuevaIncidencia = await api.post('/incidencias', {
      cliente_id: vehiculo.cliente_id,
      titulo,
      descripcion
    })

    // 2️⃣ Enviar mail automáticamente con el estado real
    await api.put(`/incidencias/${nuevaIncidencia.id}/status`, {
      status: nuevoStatus,
      adminEmail: adminEmail.value
    })

    } catch (eInc) {
      // Si ya existe esa incidencia (UNIQUE constraint) la ignoramos silenciosamente
      console.warn('Incidencia ya existente o error al crearla:', eInc)
    }

    // Actualizar la lista local
    const idx = vehiculos.value.findIndex(v => v.id === vehiculo.id)
    if (idx !== -1) {
      if (filtroActivo.value && filtroActivo.value !== nuevoStatus) {
        vehiculos.value.splice(idx, 1)
      } else {
        vehiculos.value[idx] = updated
      }
    }
    // Refrescar stats
    stats.value = await api.get('/stats')
  } catch (e) {
    console.error('Error al cambiar status:', e)
  } finally {
    procesando.value = null
  }
}

const cargarIncidencias = async () => {
  cargandoIncidencias.value = true
  try {
    incidencias.value = await api.get('/incidencias')
  } catch (e) {
    console.error('Error al cargar incidencias:', e)
    incidencias.value = []
  } finally {
    cargandoIncidencias.value = false
  }
}

const handleIncidenciaStatus = async (incidenciaId, status) => {
  procesandoIncidencia.value = incidenciaId
  feedbackIncidencia.value[incidenciaId] = null

  try {
    const response = await api.put(`/incidencias/${incidenciaId}/status`, {
      status,
      adminEmail: adminEmail.value
    })

    const statusText = status === 'accepted' ? 'ACEPTADA' : 'RECHAZADA'
    
    feedbackIncidencia.value[incidenciaId] = {
      type: 'success',
      message: `✓ Incidencia ${statusText}. Correo enviado a ${adminEmail.value}`
    }

    // Recargar incidencias después de 1.5 segundos
    setTimeout(cargarIncidencias, 1500)
  } catch (error) {
    feedbackIncidencia.value[incidenciaId] = {
      type: 'error',
      message: `❌ Error: ${error.message}`
    }
    console.error('Error:', error)
  } finally {
    procesandoIncidencia.value = null
  }
}

onMounted(async () => {
  try {
    stats.value = await api.get('/stats')
    await cargarVehiculos('pending')
    await cargarIncidencias()
  } catch (e) {
    console.error('Error al cargar stats:', e)
  } finally {
    cargando.value = false
  }
})
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
.card h3 { color: #0077be; margin-bottom: 0.8rem; }
.card p  { font-size: 1.5rem; font-weight: bold; color: #003b6f; }
.card.card-accepted { border: 2px solid #2e7d32; }
.card.card-accepted h3 { color: #2e7d32; }
.card.card-accepted p  { color: #2e7d32; }

.loading {
  text-align: center;
  color: #666;
  padding: 2rem;
}

/* --- Tabla --- */
.table-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.table-header h2 { color: #0077be; margin: 0; }

.filtros { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.filtro-btn {
  padding: 7px 16px;
  border-radius: 20px;
  border: 2px solid #cce4f5;
  background: #f0f7ff;
  color: #0077be;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.filtro-btn:hover  { background: #cce4f5; }
.filtro-btn.active { background: #0077be; color: white; border-color: #0077be; }

.vacio {
  text-align: center;
  color: #888;
  padding: 2.5rem;
  background: #f9f9f9;
  border-radius: 12px;
}

.table-wrapper { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
thead tr { background: #f0f7ff; }
th {
  padding: 10px 14px;
  text-align: left;
  color: #005f9e;
  font-weight: 700;
  white-space: nowrap;
}
td {
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  white-space: nowrap;
}
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: #fafcff; }

/* badges */
.badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}
.badge.pending  { background: #fff3cd; color: #856404; }
.badge.accepted { background: #d4edda; color: #155724; }
.badge.rejected { background: #f8d7da; color: #721c24; }

/* botones de acción */
.acciones { display: flex; gap: 6px; }

.btn-accept, .btn-reject, .btn-pending {
  padding: 5px 12px;
  border-radius: 12px;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-accept  { background: #d4edda; color: #155724; }
.btn-reject  { background: #f8d7da; color: #721c24; }
.btn-pending { background: #fff3cd; color: #856404; }
.btn-accept:hover  { background: #c3e6cb; }
.btn-reject:hover  { background: #f5c6cb; }
.btn-pending:hover { background: #ffeaa7; }
.btn-accept:disabled, .btn-reject:disabled, .btn-pending:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

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