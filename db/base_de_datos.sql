create database  Mundo_Libreria;
use Mundo_Libreria;

CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rut VARCHAR(10) NOT NULL ,
  nombre VARCHAR(50) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);
CREATE TABLE Administrador (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL
);
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
insert into Administrador values (null,'ingrid', '1234');
select * from usuario;
select * from Administrador;

show tables;
-- drop database Mundo_Libreria;