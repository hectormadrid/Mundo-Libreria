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
    imagen VARCHAR(255) DEFAULT NULL,
    descripcion TEXT,
    categoria VARCHAR (50),
    precio DECIMAL(10,2) NOT NULL,
    stock int (100),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    

CREATE TABLE carrito (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id),
  FOREIGN KEY (id_producto) REFERENCES productos(id)
);
CREATE TABLE pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado ENUM('pendiente', 'pagado', 'cancelado') DEFAULT 'pendiente',
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);
CREATE TABLE detalle_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_pedido) REFERENCES pedido(id),
  FOREIGN KEY (id_producto) REFERENCES productos(id)
);
    
insert into Administrador values (null,'ingrid', '1234');
delete from  productos where id =4;
use Mundo_Libreria;
select * from usuario;
select * from productos;
select * from carrito;
select * from pedido;
select * from detalle_pedido;
show tables;
ALTER TABLE usuario 
ADD COLUMN telefono VARCHAR(20) NULL AFTER correo,
ADD COLUMN direccion TEXT NULL AFTER telefono;
-- drop database Mundo_Libreria;