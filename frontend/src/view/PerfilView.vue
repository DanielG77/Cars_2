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
          <div class="campo"><strong>Matrícula:</strong> {{ v.matricula || '—' }}</div>
          <div class="campo"><strong>Marca:</strong> {{ v.marca || '—' }}</div>
          <div class="campo"><strong>Modelo:</strong> {{ v.modelo || '—' }}</div>
          <div class="campo"><strong>Año:</strong> {{ v.anio_matriculacion || '—' }}</div>
          <div class="campo"><strong>Color:</strong> {{ v.color || '—' }}</div>
          <div class="campo"><strong>Puertas:</strong> {{ v.puertas || '—' }}</div>
          <div class="campo"><strong>Observaciones:</strong> {{ v.observaciones || '—' }}</div>
        </div>
      </div>

      <h3>Incidencias</h3>
      <div v-if="incidencias.length === 0" class="mensaje-vacio">
        No hay incidencias registradas.
      </div>
      <div v-else class="incidencias-lista">
        <div
          v-for="i in incidencias"
          :key="i.id"
          class="incidencia-card"
          :class="tipoIncidencia(i.titulo)"
        >
          <div class="incidencia-header">
            <span class="incidencia-icono">{{ iconoIncidencia(i.titulo) }}</span>
            <strong class="incidencia-titulo">{{ i.titulo }}</strong>
          </div>
          <p class="incidencia-desc">{{ i.descripcion || '' }}</p>
          <div class="incidencia-fecha">{{ formatFecha(i.fecha_creacion) }}</div>
        </div>
      </div>

      <div class="perfil-acciones">
        <button class="btn-agregar" @click="router.push('/?directo=true')">+ Agregar vehículo</button>
        <button class="btn-primary" @click="logout">Cerrar sesión</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

const tipoIncidencia = (titulo = '') => {
  const t = titulo.toLowerCase()
  if (t.includes('aceptado')) return 'inc-aceptada'
  if (t.includes('rechazado')) return 'inc-rechazada'
  return 'inc-pendiente'
}

const iconoIncidencia = (titulo = '') => {
  const t = titulo.toLowerCase()
  if (t.includes('aceptado')) return '✔'
  if (t.includes('rechazado')) return '✖'
  return '⏳'
}

const formatFecha = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

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

// Función para normalizar la respuesta de vehículos a un array
const normalizarVehiculos = (data) => {
  console.log('Normalizando:', data)

  // Si ya es un array, lo devolvemos directamente
  if (Array.isArray(data)) {
    return data
  }

  // Si es un objeto no nulo
  if (data && typeof data === 'object') {
    // Caso 1: El objeto tiene una propiedad que es un array (ej. { vehiculos: [...] })
    const posiblesPropiedadesArray = ['vehiculos', 'data', 'results', 'items', 'lista']
    for (const prop of posiblesPropiedadesArray) {
      if (Array.isArray(data[prop])) {
        console.log(`Encontrada propiedad array: ${prop}`)
        return data[prop]
      }
    }

    // Caso 2: El objeto parece ser un vehículo único (tiene campos típicos)
    const tieneCamposVehiculo = data.id && (data.matricula || data.marca || data.modelo)
    if (tieneCamposVehiculo) {
      console.log('Objeto detectado como vehículo único, se envuelve en array')
      return [data]
    }

    // Caso 3: Objeto vacío o sin estructura reconocida -> array vacío
    if (Object.keys(data).length === 0) {
      return []
    }

    // Si no se pudo determinar, devolvemos array vacío y mostramos advertencia
    console.warn('No se pudo interpretar la respuesta:', data)
    return []
  }

  // Cualquier otro tipo (null, undefined, número, string) -> array vacío
  return []
}

onMounted(async () => {
  loadUsuario()
  if (!usuario.value) {
    router.push('/login')
    return
  }

  try {
    const id = usuario.value.id

    // Obtener vehículos desde la ruta correcta
    const responseVehiculos = await api.get(`/clientes/${id}/vehiculos`)
    console.log('Respuesta cruda de vehículos:', responseVehiculos)

    // Extraer data y normalizar
    const dataVehiculos = responseVehiculos.data ?? responseVehiculos
    vehiculos.value = normalizarVehiculos(dataVehiculos)
    console.log('Vehículos normalizados:', vehiculos.value)

    // Obtener incidencias
    const responseIncidencias = await api.get(`/incidencias/cliente/${id}`)
    const dataIncidencias = responseIncidencias.data ?? responseIncidencias
    incidencias.value = Array.isArray(dataIncidencias) ? dataIncidencias : []
    console.log('Incidencias:', incidencias.value)
  } catch (e) {
    console.error('Error al cargar datos:', e)
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

.perfil-acciones {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.btn-primary {
  background-color: #0077be;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.btn-primary:hover {
  background-color: #005fa3;
}

.btn-agregar {
  background-color: #e6f0fa;
  color: #0077be;
  padding: 10px 20px;
  border-radius: 20px;
  border: 2px solid #0077be;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-agregar:hover {
  background-color: #0077be;
  color: white;
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

.resuelta {
  color: green;
  font-weight: bold;
  margin-left: 0.5rem;
}

/* --- Incidencias --- */
.incidencias-lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.incidencia-card {
  border-radius: 12px;
  padding: 1.1rem 1.4rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.incidencia-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

/* Aceptada — verde */
.inc-aceptada {
  background-color: #1b5e20;
  border-left: 5px solid #4caf50;
  color: #e8f5e9;
}
.inc-aceptada .incidencia-titulo { color: #a5d6a7; }
.inc-aceptada .incidencia-fecha  { color: #81c784; }

/* Rechazada — negro */
.inc-rechazada {
  background-color: #111;
  border-left: 5px solid #555;
  color: #e0e0e0;
}
.inc-rechazada .incidencia-titulo { color: #bbb; }
.inc-rechazada .incidencia-fecha  { color: #777; }

/* Pendiente / revisión — azul oscuro */
.inc-pendiente {
  background-color: #e3f2fd;
  border-left: 5px solid #1565c0;
  color: #0d47a1;
}
.inc-pendiente .incidencia-titulo { color: #0d47a1; }
.inc-pendiente .incidencia-fecha  { color: #1565c0; }

.incidencia-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}
.incidencia-icono {
  font-size: 1.1rem;
}
.incidencia-titulo {
  font-size: 1rem;
  font-weight: 700;
}
.incidencia-desc {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.5;
}
.incidencia-fecha {
  font-size: 0.78rem;
  text-align: right;
  opacity: 0.8;
}
</style>