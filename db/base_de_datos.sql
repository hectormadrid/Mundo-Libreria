CREATE DATABASE IF NOT EXISTS Mundo_Libreria;
USE Mundo_Libreria;

--
-- Estructura de la tabla `categorias`
--
CREATE TABLE `categorias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL UNIQUE,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
-- Estructura de la tabla `usuario`
--
CREATE TABLE `usuario` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rut` VARCHAR(10) NOT NULL,
  `nombre` VARCHAR(50) NOT NULL,
  `correo` VARCHAR(100) NOT NULL UNIQUE,
  `telefono` VARCHAR(20) NULL,
  `direccion` TEXT NULL,
  `password` VARCHAR(255) NOT NULL,
  `reset_token_hash` VARCHAR(64) NULL UNIQUE DEFAULT NULL,
  `reset_token_expires_at` DATETIME NULL DEFAULT NULL
);

--
-- Estructura de la tabla `Administrador`
--
CREATE TABLE `Administrador` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(50) NOT NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL
);

--
-- Estructura de la tabla `productos`
--
CREATE TABLE `productos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL,
    `codigo_barras` VARCHAR(255) UNIQUE DEFAULT NULL,
    `id_categoria` INT NULL,
    `imagen` VARCHAR(255) DEFAULT NULL,
    `descripcion` TEXT,
    `precio` DECIMAL(10,2) NOT NULL,
    `stock` INT DEFAULT 0,
    `estado` ENUM('activo', 'inactivo') DEFAULT 'activo',
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

--
-- Estructura de la tabla `carrito`
--
CREATE TABLE `carrito` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_usuario` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `cantidad` INT NOT NULL DEFAULT 1,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id`) ON DELETE CASCADE
);

--
-- Estructura de la tabla `pedido`
--
CREATE TABLE `pedido` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_usuario` INT NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `estado` ENUM('pendiente', 'pagado', 'cancelado') DEFAULT 'pendiente',
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id`) ON DELETE CASCADE
);

--
-- Estructura de la tabla `detalle_pedido`
--
CREATE TABLE `detalle_pedido` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_pedido` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`id_pedido`) REFERENCES `pedido`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id`) ON DELETE CASCADE
);

--
-- Datos iniciales
--
INSERT INTO `categorias` (`nombre`) VALUES
('Libreria'),
('Oficina'),
('Papeleria');

INSERT INTO `Administrador` (`id`, `nombre`, `tipo`, `password`) VALUES
(NULL, 'ingrid', 'administrador', '$2y$10$UAW3EuwP8tN.eToRjgS0TeiWCX7c/IegE2xE0nkFM69YFPXoM3gg6');