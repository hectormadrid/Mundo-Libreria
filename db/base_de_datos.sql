create database  Mundo_Libreria
use Mundo_Libreria

create table usuario (
  id int auto_increment primary key,
  nombre varchar(20),
  correo varchar(30),
  password varchar(30)
);


insert into usuario values (null, 'hector', 'prueba@gmail.com', '1234');
select * from usuario;

-- drop database Mundo_Libreria;