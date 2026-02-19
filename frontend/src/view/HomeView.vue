<template>
  <div class="container">
    <div v-if="mostrarHome" class="home-section">
      <div v-if="!selectedBrand" class="brand-selection">
        <h1 class="title">Selecciona tu marca</h1>
        <div class="brand-grid">
          <div v-for="(path, brand) in logos" :key="brand" class="brand-card" @click="selectBrand(brand)">
            <img :src="getLogoUrl(brand)" :alt="brand" class="brand-logo">
            <span class="brand-name">{{ brand }}</span>
          </div>
        </div>
      </div>
      
      <div v-else class="brand-details">
        <div class="details-card">
          <button class="btn-back" @click="clearSelection">← Volver</button>
          <img :src="getLogoUrl(selectedBrand)" :alt="selectedBrand" class="details-logo">
          <h2>{{ selectedBrand }}</h2>
          <div class="affected-info">
            <h3>Selecciona el año de tu vehículo:</h3>
            <div v-if="affectedYears.length" class="years-grid">
              <span 
                v-for="year in affectedYears" 
                :key="year" 
                class="year-badge"
                :class="{ active: selectedYear === year }"
                @click="selectedYear = year"
              >
                {{ year }}
              </span>
            </div>
            <p v-else>No se han encontrado modelos afectados para esta marca.</p>
          </div>
          <button 
            @click="iniciarComprobacion" 
            class="btn-primary" 
            :disabled="!selectedYear"
          >
            {{ selectedYear ? 'Comprobar vehículo de ' + selectedYear : 'Selecciona un año' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="form-section">
      <h2>Registra los datos de tu vehículo</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label>Matrícula *</label>
            <input v-model="vehiculo.matricula" required placeholder="Ej: 1234ABC">
          </div>
          <div class="form-group">
            <label>Marca *</label>
            <input v-model="vehiculo.marca" required disabled class="readonly-input" title="Seleccionado desde la página principal">
          </div>
          <div class="form-group">
            <label>Modelo *</label>
            <input v-model="vehiculo.modelo" required placeholder="Ej: Clio">
          </div>
          <div class="form-group">
            <label>Año de matriculación *</label>
            <input v-model="vehiculo.anio_matriculacion" type="number" required disabled class="readonly-input" title="Seleccionado desde la página principal">
          </div>
          <div class="form-group">
            <label>Color</label>
            <input v-model="vehiculo.color" placeholder="Ej: Azul">
          </div>
          <div class="form-group">
            <label>Número de puertas</label>
            <input v-model="vehiculo.puertas" type="number" placeholder="Ej: 5">
          </div>
          <div class="form-group full-width">
            <label>Observaciones</label>
            <textarea v-model="vehiculo.observaciones" rows="3" placeholder="Detalles adicionales..."></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" @click="volverAlHome" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="cargando">
            {{ cargando ? 'Comprobando...' : 'Comprobar vehículo' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import vehiculosAfectados from '@/data/afectados.json'
import logos from '@/data/logos.json'

const router = useRouter()

const selectedBrand = ref(null)
const selectedYear = ref(null)
const affectedYears = ref([])

const selectBrand = (brand) => {
  selectedBrand.value = brand
  const info = vehiculosAfectados.find(v => v.marca.toLowerCase() === brand.toLowerCase())
  affectedYears.value = info ? info.anios : []
  selectedYear.value = null // Reset year when brand changes
}

const clearSelection = () => {
  selectedBrand.value = null
  selectedYear.value = null
  affectedYears.value = []
}

const getLogoUrl = (brand) => {
  const path = logos[brand]
  return `/${path}`
}

const iniciarComprobacion = () => {
  vehiculo.value.marca = selectedBrand.value
  vehiculo.value.anio_matriculacion = selectedYear.value
  mostrarHome.value = false
}

const mostrarHome = ref(true)

const vehiculo = ref({
  matricula: '',
  marca: '',
  modelo: '',
  anio_matriculacion: null,
  color: '',
  puertas: null,
  observaciones: ''
})

const cargando = ref(false)

const normalizarTexto = (texto) => {
  if (!texto) return ''
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

const comprobarVehiculo = (datos) => {
  const marcaNorm = normalizarTexto(datos.marca)
  const modeloNorm = normalizarTexto(datos.modelo)
  const anio = datos.anio_matriculacion // puede ser null

  // Si falta marca o modelo, no puede estar afectado (aunque son obligatorios)
  if (!marcaNorm || !modeloNorm) return false

  return vehiculosAfectados.some(v => 
    normalizarTexto(v.marca) === marcaNorm &&
    normalizarTexto(v.modelo) === modeloNorm &&
    v.anio_matriculacion === anio
  )
}

const guardarVehiculoLocal = (datos, afectado) => {
  try {
    // Recuperar vehículos existentes o inicializar array vacío
    const existentes = JSON.parse(localStorage.getItem('vehiculosRegistrados') || '[]')
    // Agregar nuevo vehículo con fecha y resultado
    existentes.push({
      ...datos,
      afectado,
      fechaRegistro: new Date().toISOString()
    })
    localStorage.setItem('vehiculosRegistrados', JSON.stringify(existentes))
    return true
  } catch (error) {
    console.error('Error al guardar en localStorage:', error)
    return false
  }
}

const volverAlHome = () => {
  vehiculo.value = { matricula: '', marca: '', modelo: '', anio_matriculacion: null, color: '', puertas: null, observaciones: '' }
  mostrarHome.value = true
}

const handleSubmit = async () => {
  cargando.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const afectado = comprobarVehiculo(vehiculo.value)

    const usuarioRaw = localStorage.getItem('usuario')
    const logged = usuarioRaw ? JSON.parse(usuarioRaw) : null

    if (logged) {
      // Usuario logueado: guardamos en localStorage
      const guardado = guardarVehiculoLocal(vehiculo.value, afectado)
      if (guardado) {
        await Swal.fire({ 
          icon: 'success', 
          title: 'Vehículo guardado', 
          text: 'Su vehículo ha sido registrado en su cuenta.', 
          confirmButtonColor: '#3085d6' 
        })
      } else {
        await Swal.fire('Error', 'No se pudo guardar el vehículo', 'error')
      }
      volverAlHome()
    } else {
      // Si no está logueado, lo mandamos a registrarse DIRECTAMENTE si es un vehículo de la lista
      // Guardar datos del vehículo en localStorage para vincular después del registro
      localStorage.setItem('vehiculoPendiente', JSON.stringify(vehiculo.value))

      if (afectado) {
        await Swal.fire({
          icon: 'info',
          title: 'Vehículo afectado',
          text: 'Su vehículo está dentro de los afectados. Para poder gestionar la incidencia, debe crear una cuenta.',
          confirmButtonColor: '#3085d6'
        })
      } else {
        await Swal.fire({
          icon: 'info',
          title: 'Registro necesario',
          text: 'Aunque su vehículo no parece estar afectado por los años seleccionados, le pediremos que se registre para un análisis detallado.',
          confirmButtonColor: '#3085d6'
        })
      }
      router.push('/login')
    }
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Hubo un problema al procesar la solicitud', 'error')
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e6f0fa 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.home-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem 0;
}

.brand-selection {
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
  text-align: center;
}

.brand-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 2rem;
}

.brand-card {
  flex: 0 1 180px;
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.brand-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 119, 190, 0.15);
}

.brand-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.brand-name {
  font-weight: 600;
  color: #003b6f;
}

.brand-details {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 2rem;
}

.details-card {
  background: white;
  border-radius: 25px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
  position: relative;
}

.btn-back {
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  color: #0077be;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.details-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 1.5rem;
}

.affected-info {
  margin: 2rem 0;
  text-align: left;
}

.affected-info h3 {
  color: #003b6f;
  margin-bottom: 1rem;
}

.years-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.year-badge {
  background: #e6f0fa;
  color: #0077be;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.year-badge:hover {
  background: #cce4f5;
  transform: scale(1.05);
}

.year-badge.active {
  background: #0077be;
  color: white;
  border-color: #005f9e;
  box-shadow: 0 4px 10px rgba(0, 119, 190, 0.3);
}

.hero {
  text-align: center;
  max-width: 1200px;
  padding: 2rem;
}

.hero-image {
  width: 100%;
  max-width: 800px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 119, 190, 0.3);
  margin-bottom: 2rem;
  border: 4px solid white;
}

.title {
  font-size: 3rem;
  color: #003b6f;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(255,255,255,0.8);
}

.btn-primary {
  background-color: #0077be;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(0, 119, 190, 0.3);
  transition: all 0.3s;
  font-weight: bold;
  letter-spacing: 1px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #005f9e;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 119, 190, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: #0077be;
  border: 2px solid #0077be;
  padding: 13px 38px;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  margin-right: 1rem;
}

.btn-secondary:hover {
  background-color: #e6f0fa;
}

.form-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
  background: white;
  border-radius: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  position: relative;
  top: 5vh;
}

.form-section h2 {
  color: #003b6f;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: span 2;
}

label {
  font-weight: 600;
  color: #005f9e;
  margin-bottom: 0.5rem;
}

input, textarea {
  padding: 0.8rem;
  border: 2px solid #cce4f5;
  border-radius: 10px;
  font-size: 1rem;
  transition: border 0.3s;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #0077be;
}

.readonly-input {
  background-color: #f0f4f8;
  color: #555;
  cursor: not-allowed;
  border-color: #d1d9e0;
}

.readonly-input:focus {
  border-color: #d1d9e0;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-group.full-width {
    grid-column: span 1;
  }
}
</style>