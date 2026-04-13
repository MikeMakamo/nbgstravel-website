CREATE TABLE IF NOT EXISTS package_route_stops (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT UNSIGNED NOT NULL,
  stop_order INT NOT NULL DEFAULT 0,
  continent VARCHAR(100) NULL,
  country VARCHAR(100) NULL,
  region_name VARCHAR(120) NULL,
  city_name VARCHAR(120) NULL,
  nights_at_stop INT NULL,
  note VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_package_route_stops_package FOREIGN KEY (package_id) REFERENCES packages(id),
  INDEX idx_package_route_stops_package (package_id, stop_order)
);
