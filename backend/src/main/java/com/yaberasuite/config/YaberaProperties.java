package com.yaberasuite.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "yabera")
public class YaberaProperties {

    private final Admin admin = new Admin();
    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Property property = new Property();
    private final Mail mail = new Mail();

    public Admin getAdmin() {
        return admin;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public Cors getCors() {
        return cors;
    }

    public Property getProperty() {
        return property;
    }

    public Mail getMail() {
        return mail;
    }

    public static class Admin {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class Jwt {
        private String secret;
        private long expirationMs;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getExpirationMs() {
            return expirationMs;
        }

        public void setExpirationMs(long expirationMs) {
            this.expirationMs = expirationMs;
        }
    }

    public static class Cors {
        private String allowedOrigins;

        public String getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(String allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class Property {
        private String name = "Yabera Suite";

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    public static class Mail {
        /** The "From" address shown in outgoing emails. */
        private String from;

        /** Admin address that receives internal copies (optional). */
        private String adminAddress;

        /** Local or classpath path of the QR image embedded in payment emails. */
        private String qrPath;

        public String getFrom() {
            return from;
        }

        public void setFrom(String from) {
            this.from = from;
        }

        public String getAdminAddress() {
            return adminAddress;
        }

        public void setAdminAddress(String adminAddress) {
            this.adminAddress = adminAddress;
        }

        public String getQrPath() {
            return qrPath;
        }

        public void setQrPath(String qrPath) {
            this.qrPath = qrPath;
        }
    }
}
