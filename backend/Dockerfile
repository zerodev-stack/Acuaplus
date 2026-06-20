# Etapa de construcción
FROM node:20-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar todas las dependencias (incluyendo devDependencies para compilar)
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Compilar el proyecto
RUN pnpm run build

# Etapa de producción
FROM node:20-alpine

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Variable de entorno para producción
ENV NODE_ENV=production

# Copiar package.json y pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Instalar solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Copiar los archivos compilados desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Crear directorio para subidas si es necesario
RUN mkdir -p uploads

# Exponer el puerto (ajustar si es diferente)
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["node", "dist/server.js"]
