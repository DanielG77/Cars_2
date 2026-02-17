<template>
  <div class="container">
    <!-- PANTALLA HOME -->
    <div v-if="mostrarHome" class="home-section">
      <div class="hero">
        <img src="https://via.placeholder.com/1200x600/0077be/ffffff?text=Coche+Azul" alt="Coche" class="hero-image">
        <h1 class="title">Comprobación de remesas</h1>
        <button @click="mostrarHome = false" class="btn-primary">Realizar comprobación</button>
      </div>
    </div>

    <!-- FORMULARIO DE VEHÍCULO -->
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
            <input v-model="vehiculo.marca" required placeholder="Ej: Renault">
          </div>
          <div class="form-group">
            <label>Modelo *</label>
            <input v-model="vehiculo.modelo" required placeholder="Ej: Clio">
          </div>
          <div class="form-group">
            <label>Año de matriculación</label>
            <input v-model="vehiculo.anio_matriculacion" type="number" placeholder="Ej: 2020">
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
// Importamos la lista de vehículos afectados (asegúrate de que la ruta sea correcta)
import vehiculosAfectados from '@/data/afectados.json'

const router = useRouter()

// Estado de la vista
const mostrarHome = ref(true)

// Datos del vehículo
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

// Función para normalizar texto (quita acentos y pasa a minúsculas)
const normalizarTexto = (texto) => {
  if (!texto) return ''
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

// Comprobación local contra el JSON
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

// Guardar vehículo en localStorage (simula el guardado para usuarios logueados)
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

// Volver al home sin guardar
const volverAlHome = () => {
  vehiculo.value = { matricula: '', marca: '', modelo: '', anio_matriculacion: null, color: '', puertas: null, observaciones: '' }
  mostrarHome.value = true
}

// Envío del formulario
const handleSubmit = async () => {
  cargando.value = true
  try {
    // Comprobación síncrona (simulamos una pequeña pausa para mejorar UX)
    await new Promise(resolve => setTimeout(resolve, 500))
    const afectado = comprobarVehiculo(vehiculo.value)

    const usuarioRaw = localStorage.getItem('usuario')
    const logged = usuarioRaw ? JSON.parse(usuarioRaw) : null

    if (logged) {
      // Usuario logueado: guardamos en localStorage (simulando backend)
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
      if (afectado) {
        // Guardar datos del vehículo en localStorage para vincular después del registro
        localStorage.setItem('vehiculoPendiente', JSON.stringify(vehiculo.value))

        await Swal.fire({
          icon: 'info',
          title: 'Vehículo afectado',
          text: 'Su vehículo está dentro de los afectados. Disculpe las molestias, le pediremos que registre un usuario para poder llevar a cabo la gestión.',
          confirmButtonColor: '#3085d6'
        })
        router.push('/login')
      } else {
        await Swal.fire({
          icon: 'success',
          title: 'Vehículo no afectado',
          text: 'Su vehículo no está en la lista de remesas. No necesita realizar ningún trámite.',
          confirmButtonColor: '#3085d6'
        })
        volverAlHome()
      }
    }
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Hubo un problema al comprobar el vehículo', 'error')
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