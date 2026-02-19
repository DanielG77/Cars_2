<template>
  <div class="perfil-container">
    <h2>Mi perfil</h2>
    <div v-if="!usuario">Cargando...</div>
    <div v-else>
      <p><strong>Nombre:</strong> {{ usuario.nombre }} {{ usuario.apellidos || '' }}</p>
      <p><strong>Email:</strong> {{ usuario.email || '-' }}</p>

      <h3>Vehículos</h3>
      <div v-if="vehiculos.length === 0" class="mensaje-vacio">
        Todavía no ha registrado ningún vehículo.
      </div>
      <div v-else class="vehiculos-grid">
        <div v-for="v in vehiculos" :key="v.id" class="vehiculo-card">
          <!-- Mostramos los campos con valores por defecto si no existen -->
          <div class="campo"><strong>Matrícula:</strong> {{ v.matricula || '—' }}</div>
          <div class="campo"><strong>Marca:</strong> {{ v.marca || '—' }}</div>
          <div class="campo"><strong>Modelo:</strong> {{ v.modelo || '—' }}</div>
          <div class="campo"><strong>Año:</strong> {{ v.anio_matriculacion || '—' }}</div>
          <div class="campo"><strong>Color:</strong> {{ v.color || '—' }}</div>
          <div class="campo"><strong>Puertas:</strong> {{ v.puertas || '—' }}</div>
          <div class="campo"><strong>Observaciones:</strong> {{ v.observaciones || '—' }}</div>
          <!-- Opcional: mostrar el objeto completo para depuración (comentar en producción) -->
          <!-- <pre class="debug">{{ v }}</pre> -->
        </div>
      </div>

      <h3>Incidencias</h3>
      <ul v-if="incidencias.length === 0">
        <li class="mensaje-vacio">No hay incidencias registradas.</li>
      </ul>
      <ul v-else>
        <li v-for="i in incidencias" :key="i.id">{{ i.titulo }} — {{ i.descripcion || '' }}</li>
      </ul>

      <button class="btn-primary" @click="logout">Cerrar sesión</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

const router = useRouter()
const usuario = ref(null)
const vehiculos = ref([])
const incidencias = ref([])

const loadUsuario = () => {
  try {
    const raw = localStorage.getItem('usuario')
    usuario.value = raw ? JSON.parse(raw) : null
  } catch (e) {
    usuario.value = null
  }
}

const logout = () => {
  localStorage.removeItem('usuario')
  router.push('/')
}

onMounted(async () => {
  loadUsuario()
  if (!usuario.value) {
    router.push('/login')
    return
  }
  try {
    const id = usuario.value.id

    // Obtener vehículos
    const responseVehiculos = await api.get(`/vehiculos/${id}`)
    console.log('Respuesta completa de vehículos:', responseVehiculos)

    // Normalizar la respuesta para obtener un array
    if (Array.isArray(responseVehiculos)) {
      vehiculos.value = responseVehiculos
    } else if (responseVehiculos && typeof responseVehiculos === 'object') {
      // Posibles estructuras: { data: [...], vehiculos: [...], results: [...], etc.
      // Intentamos encontrar una propiedad que sea un array
      const possibleArrayProps = ['vehiculos', 'data', 'results', 'items', 'lista']
      let foundArray = null
      for (const prop of possibleArrayProps) {
        if (Array.isArray(responseVehiculos[prop])) {
          foundArray = responseVehiculos[prop]
          break
        }
      }
      if (foundArray) {
        vehiculos.value = foundArray
      } else {
        // Si no encontramos un array, pero el objeto no está vacío, lo envolvemos en un array
        // (por si acaso la respuesta es un único vehículo como objeto)
        if (Object.keys(responseVehiculos).length > 0 && responseVehiculos.id) {
          vehiculos.value = [responseVehiculos]
        } else {
          vehiculos.value = []
        }
      }
    } else {
      vehiculos.value = []
    }

    console.log('Vehículos procesados:', vehiculos.value)

    // Obtener incidencias (suponiendo que la respuesta es un array)
    const responseIncidencias = await api.get(`/incidencias/cliente/${id}`)
    incidencias.value = Array.isArray(responseIncidencias) ? responseIncidencias : []
  } catch (e) {
    console.error('Error al cargar datos:', e)
    // Podrías mostrar un mensaje al usuario con un ref adicional
  }
})
</script>

<style scoped>
.perfil-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.06);
}

.btn-primary {
  background-color: #0077be;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}
.btn-primary:hover {
  background-color: #005fa3;
}

.mensaje-vacio {
  color: #666;
  font-style: italic;
  margin: 1rem 0;
  padding: 0.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.vehiculos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.vehiculo-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.2rem;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0,0,0,0.02);
  transition: transform 0.2s, box-shadow 0.2s;
}
.vehiculo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
}

.campo {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  line-height: 1.4;
  color: #333;
}
.campo strong {
  color: #0077be;
  font-weight: 600;
}

h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #222;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

ul {
  list-style: none;
  padding: 0;
}
ul li {
  background: #f2f2f2;
  margin: 0.5rem 0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
}

.debug {
  font-size: 0.7rem;
  background: #eee;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 0.5rem;
}
</style>