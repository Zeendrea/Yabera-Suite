package com.yaberasuite.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "yabera")
public class YaberaProperties {

    private final Admin admin = new Admin();
    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Property property = new Property();

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

}
