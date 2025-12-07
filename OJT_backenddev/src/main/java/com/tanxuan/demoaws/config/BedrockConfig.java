package com.tanxuan.demoaws.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockagentruntime.BedrockAgentRuntimeAsyncClient;
import software.amazon.awssdk.services.bedrockagentruntime.BedrockAgentRuntimeClient;
@Configuration
public class BedrockConfig {

    @Bean
    public BedrockAgentRuntimeAsyncClient bedrockClient() {
        return BedrockAgentRuntimeAsyncClient.builder()
                .region(Region.AP_SOUTHEAST_1)
                .build();
    }
}