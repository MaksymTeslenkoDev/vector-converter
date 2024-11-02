create database if not exists vector_converter_test;
create user if not exists 'marcus'@'%' identified by 'marcuspass';
grant all privileges on vector_converter_test.* to 'marcus'@'%';