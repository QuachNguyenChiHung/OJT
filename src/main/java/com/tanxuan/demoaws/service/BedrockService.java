package com.tanxuan.demoaws.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.bedrock.BedrockClient;
import software.amazon.awssdk.services.bedrockagentruntime.BedrockAgentRuntimeClient;
import software.amazon.awssdk.services.bedrockagentruntime.model.CreateInvocationRequest;
import software.amazon.awssdk.services.bedrockagentruntime.model.CreateInvocationResponse;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

import java.util.UUID;

@Service
public class BedrockService {

    private static final Logger log = LoggerFactory.getLogger(BedrockService.class);
    @Value("${bedrock.agent.id}")
    private String agentId;
    private final BedrockRuntimeClient bedrockClient;
    public BedrockService(BedrockRuntimeClient bedrockClient) {
        this.bedrockClient = bedrockClient;
    }
    public String invokeModel(String inputText) {
        InvokeModelRequest request = InvokeModelRequest.builder()
                .modelId(agentId)
                .body(SdkBytes.fromUtf8String(inputText))
                .build();
        InvokeModelResponse response = bedrockClient.invokeModel(request);

        return response.body().asUtf8String();
    }
}
