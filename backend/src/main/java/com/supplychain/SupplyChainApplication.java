package com.supplychain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = { RedisRepositoriesAutoConfiguration.class })
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableJpaAuditing
public class SupplyChainApplication {

    public static void main(String[] args) {
        SpringApplication.run(SupplyChainApplication.class, args);
    }
}
