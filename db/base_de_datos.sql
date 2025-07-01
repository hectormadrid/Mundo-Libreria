create database  Mundo_Libreria
use Mundo_Libreria

CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rut VARCHAR(10) NOT NULL ,
  nombre VARCHAR(50) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

insert into usuario values (null,'20987456-8', 'hector', 'prueba@gmail.com', '1234');
select * from usuario;
SELECT password FROM usuario WHERE correo = 'prueba@gmail.com';
-- drop database Mundo_Libreria;