<template>
  <div class="login-container">
    <div class="login-card">
      <h2>{{ modoRegistro ? 'Registro' : 'Iniciar sesión' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div v-if="modoRegistro" class="form-group">
          <label>Nombre completo</label>
          <input v-model="usuario.nombre" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="usuario.email" required>
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" v-model="usuario.password" required>
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

const router = useRouter()
const modoRegistro = ref(false)
const cargando = ref(false)

const usuario = ref({
  nombre: '',
  email: '',
  password: ''
})

// Al montar, comprobamos si hay vehículo pendiente
onMounted(() => {
  const pendiente = localStorage.getItem('vehiculoPendiente')
  if (pendiente) {
    Swal.fire({
      icon: 'info',
      title: 'Vehículo pendiente',
      text: 'Por favor, regístrese para vincular su vehículo afectado.',
      confirmButtonColor: '#3085d6'
    })
    // Forzamos modo registro si hay vehículo pendiente
    modoRegistro.value = true
  }
})

const handleSubmit = async () => {
  cargando.value = true
  // Simulamos proceso de autenticación/registro
  setTimeout(() => {
    if (modoRegistro.value) {
      // Simular registro exitoso
      const vehiculoPendiente = localStorage.getItem('vehiculoPendiente')
      if (vehiculoPendiente) {
        // Aquí se vincularía el vehículo al usuario en el backend
        localStorage.removeItem('vehiculoPendiente')
        Swal.fire({
          icon: 'success',
          title: 'Registro completado',
          text: 'Su vehículo ha sido vinculado a su cuenta. Ya puede gestionar su remesa.',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          router.push('/')
        })
      } else {
        // Registro sin vehículo
        Swal.fire({
          icon: 'success',
          title: 'Registro completado',
          text: 'Bienvenido. Puede iniciar sesión.',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          modoRegistro.value = false
          usuario.value = { nombre: '', email: '', password: '' }
        })
      }
    } else {
      // Simular login exitoso
      Swal.fire({
        icon: 'success',
        title: 'Bienvenido',
        text: 'Ha iniciado sesión correctamente.',
        confirmButtonColor: '#3085d6'
      }).then(() => {
        router.push('/')
      })
    }
    cargando.value = false
  }, 1500)
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
</style>