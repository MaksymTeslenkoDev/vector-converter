create table if not exists `origin`(
	`origin_pk` int(11) NOT NULL AUTO_INCREMENT,
	`name` varchar(255) DEFAULT NULL,
	`format` varchar(255) NOT NULL,
	`link` varchar(255) NOT NULL,
	PRIMARY KEY (`origin_pk`)
)