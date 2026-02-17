# Usar una imagen ligera de Node.js
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto configurado en el backend
EXPOSE 3000

# Comando para arrancar el servidor
CMD ["npm", "start"]
