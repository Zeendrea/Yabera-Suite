package com.yaberasuite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class YaberaSuiteApplication {

    public static void main(String[] args) {
        SpringApplication.run(YaberaSuiteApplication.class, args);
    }
}
