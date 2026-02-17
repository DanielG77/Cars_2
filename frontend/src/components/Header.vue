<template>
	<header class="app-header">
		<div class="container">
			<div class="brand">
				<router-link to="/" class="logo">RemesasCars</router-link>
			</div>
			<nav class="nav">
				<template v-if="usuario">
					<router-link to="/perfil" class="nav-link">Perfil</router-link>
					<button class="btn-logout" @click="logout">Cerrar sesión</button>
				</template>
				<template v-else>
					<router-link to="/login" class="nav-link">Acceder</router-link>
				</template>
			</nav>
		</div>
	</header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const usuario = ref(null)

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
	// keep vehiculoPendiente if present
	loadUsuario()
	router.push('/')
}

onMounted(() => {
	loadUsuario()
	// sync across tabs
	window.addEventListener('storage', (e) => {
		if (e.key === 'usuario') loadUsuario()
	})
})
</script>

<style scoped>
.app-header {
	background: linear-gradient(90deg,#0077be,#005f9e);
	color: white;
	padding: 0.6rem 0;
	box-shadow: 0 4px 8px rgba(0,0,0,0.08);
}
.app-header .container {
	max-width: 1100px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 1rem;
}
.logo {
	color: white;
	font-weight: 800;
	text-decoration: none;
	font-size: 1.1rem;
}
.nav .nav-link {
	color: white;
	margin-right: 1rem;
	text-decoration: none;
	font-weight: 600;
}
.btn-logout {
	background: transparent;
	border: 1px solid rgba(255,255,255,0.2);
	color: white;
	padding: 6px 12px;
	border-radius: 20px;
	cursor: pointer;
}
</style>
