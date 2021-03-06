DROP DATABASE IF EXISTS flybuy_refdb;
CREATE DATABASE flybuy_refdb;

USE flybuy_refdb; 
Drop TABLE IF EXISTS places;

CREATE TABLE IF NOT EXISTS places (
	`id` INT NOT NULL AUTO_INCREMENT,
    `CityId` VARCHAR(4) CHARACTER SET utf8,
    `CityName` VARCHAR(23) CHARACTER SET utf8,
    `CountryName` VARCHAR(13) CHARACTER SET utf8,
    `IataCode` VARCHAR(3) CHARACTER SET utf8,
    `Name` VARCHAR(39) CHARACTER SET utf8,
    `PlaceId` INT,
    `SkyscannerCode` VARCHAR(3) CHARACTER SET utf8,
    `Type` VARCHAR(7) CHARACTER SET utf8,
    PRIMARY KEY (id)
);