<template>
  <div class="login-container">
    <div class="login-card">
        <h2>{{ modoRegistro ? 'Registro' : 'Iniciar sesión' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div v-if="modoRegistro" class="form-group">
            <label>DNI</label>
            <input
              v-model="usuario.dni"
              required
              placeholder="Ej: 12345678A"
              :class="{ 'input-error': errores.dni }"
              @input="errores.dni = ''"
            >
            <span v-if="errores.dni" class="error-msg">{{ errores.dni }}</span>
          </div>
          <div v-if="modoRegistro" class="form-group">
            <label>Nombre</label>
            <input v-model="usuario.nombre" required>
          </div>
          <div v-if="modoRegistro" class="form-group">
            <label>Apellidos</label>
            <input v-model="usuario.apellidos" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="usuario.email" required>
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              v-model="usuario.password"
              placeholder="Introduzca su contraseña"
            >
          </div>
          <button type="submit" class="btn-primary" :disabled="cargando">
            {{ cargando ? 'Procesando...' : (modoRegistro ? 'Registrarse' : 'Acceder') }}
          </button>
        </form>
      <p class="toggle-modo">
        {{ modoRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?' }}
        <a href="#" @click.prevent="modoRegistro = !modoRegistro">
          {{ modoRegistro ? 'Inicia sesión' : 'Regístrate' }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { api } from '../services/api'
import adminsData from '../data/admin.json'

const router = useRouter()
const modoRegistro = ref(false)
const cargando = ref(false)
const errores = ref({ dni: '' })

const REGEX_DNI = /^\d{8}[A-Za-z]$/

const validarRegistro = () => {
  errores.value.dni = ''
  if (modoRegistro.value) {
    const dni = usuario.value.dni.trim().toUpperCase()
    if (!REGEX_DNI.test(dni)) {
      errores.value.dni = 'DNI no válido. Debe tener 8 dígitos seguidos de una letra. Ej: 12345678A'
      return false
    }
    usuario.value.dni = dni
  }
  return true
}

const usuario = ref({
  dni: '',
  nombre: '',
  apellidos: '',
  email: ''
})

const vincularVehiculoPendiente = async (clienteId) => {
  const vehiculoPendiente = localStorage.getItem('vehiculoPendiente')
  if (!vehiculoPendiente) return false
  try {
    const veh = JSON.parse(vehiculoPendiente)
    const payload = { ...veh, cliente_id: parseInt(clienteId, 10) }
    await api.post('/vehiculos', payload)
    localStorage.removeItem('vehiculoPendiente')
    await Swal.fire({
      icon: 'success',
      title: 'Vehículo vinculado',
      text: 'Su vehículo ha sido vinculado a su cuenta correctamente.',
      confirmButtonColor: '#3085d6'
    })
    return true
  } catch (error) {
    console.error('Error al vincular vehículo:', error)
    await Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'No se pudo vincular el vehículo. Puede hacerlo más tarde desde su panel.',
      confirmButtonColor: '#3085d6'
    })
    return false
  }
}

onMounted(() => {
  const pendiente = localStorage.getItem('vehiculoPendiente')
  if (pendiente) {
    Swal.fire({
      icon: 'info',
      title: 'Vehículo pendiente',
      text: 'Por favor, inicie sesión o regístrese para vincular su vehículo afectado.',
      confirmButtonColor: '#3085d6'
    })
  }
})

const handleSubmit = async () => {
  if (!validarRegistro()) return
  cargando.value = true
  try {
    if (modoRegistro.value) {
      // --- REGISTRO ---
      const payload = {
        dni: usuario.value.dni,
        nombre: usuario.value.nombre,
        apellidos: usuario.value.apellidos,
        email: usuario.value.email
      }
      const created = await api.post('/clientes', payload)
      localStorage.setItem('usuario', JSON.stringify(created))
      await vincularVehiculoPendiente(created.id)
      await Swal.fire({
        icon: 'success',
        title: 'Registro completado',
        text: 'Bienvenido. Ya puede gestionar su remesa.',
        confirmButtonColor: '#3085d6'
      })
      router.push('/')
    } else {
      // --- LOGIN ADMIN POR EMAIL SOLO ---
      const adminMatch = adminsData.find(a => a.email === usuario.value.email)
      if (adminMatch) {
        localStorage.setItem('usuario', JSON.stringify({ ...adminMatch, rol: 'admin' }))
        await Swal.fire({
          icon: 'success',
          title: 'Bienvenido Admin',
          text: 'Ha iniciado sesión correctamente como administrador.',
          confirmButtonColor: '#3085d6'
        })
        router.push('/')
        return
      }

      // --- LOGIN CLIENTE NORMAL ---
      try {
        const cliente = await api.get(`/clientes/email/${encodeURIComponent(usuario.value.email)}`)
        localStorage.setItem('usuario', JSON.stringify(cliente))
        await vincularVehiculoPendiente(cliente.id)
        await Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: 'Ha iniciado sesión correctamente.',
          confirmButtonColor: '#3085d6'
        })
        router.push('/')
      } catch (error) {
        if (error.response && error.response.status === 404) {
          await Swal.fire({
            icon: 'warning',
            title: 'No encontrado',
            text: 'No existe un usuario con ese email. Regístrese primero.',
            confirmButtonColor: '#3085d6'
          })
          modoRegistro.value = true
        } else {
          throw error
        }
      }
    }
  } catch (error) {
    console.error(error)
    await Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema con la solicitud al servidor.' })
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e6f0fa 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 30px;
  padding: 3rem 2rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 119, 190, 0.2);
}

.login-card h2 {
  color: #003b6f;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #005f9e;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #cce4f5;
  border-radius: 10px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #0077be;
}

.btn-primary {
  width: 100%;
  background-color: #0077be;
  color: white;
  border: none;
  padding: 12px;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(0, 119, 190, 0.3);
  transition: all 0.3s;
  font-weight: bold;
  margin-top: 1rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #005f9e;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-modo {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.toggle-modo a {
  color: #0077be;
  text-decoration: none;
  font-weight: 600;
}

.toggle-modo a:hover {
  text-decoration: underline;
}

.input-error {
  border-color: #e53935 !important;
  background-color: #fff5f5;
}

.error-msg {
  color: #e53935;
  font-size: 0.82rem;
  margin-top: 4px;
  display: block;
}
</style>