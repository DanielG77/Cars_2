<template>
  <div class="perfil-container">
    <h2>Mi perfil</h2>
    <div v-if="!usuario">Cargando...</div>
    <div v-else>
      <p><strong>Nombre:</strong> {{ usuario.nombre }} {{ usuario.apellidos || '' }}</p>
      <p><strong>Email:</strong> {{ usuario.email || '-' }}</p>

      <h3>Vehículos</h3>
      <ul>
        <li v-for="v in vehiculos" :key="v.id">{{ v.matricula }} — {{ v.marca }} {{ v.modelo }}</li>
      </ul>

      <h3>Incidencias</h3>
      <ul>
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
    vehiculos.value = await api.get(`/clientes/${id}/vehiculos`)
    incidencias.value = await api.get(`/incidencias/cliente/${id}`)
  } catch (e) {
    console.error(e)
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
.btn-primary { background-color: #0077be; color: white; padding: 10px 20px; border-radius: 20px; border: none; }
</style>
