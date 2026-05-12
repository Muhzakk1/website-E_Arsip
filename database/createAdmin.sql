-- Ganti password hash sesuai kebutuhan (ini = "admin123")
-- Generate hash di: https://bcrypt-generator.com/
INSERT INTO users (nama, email, password_hash, role)
VALUES ('Administrator', 'admin@dinas.go.id', '$2a$10$A9f2eWv.M5cteLnfbw8J3.vOLY9wMhmzwTkl3xAhwon2TLCwGIE6i', 'admin');