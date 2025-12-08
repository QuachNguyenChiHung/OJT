package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.config.BedrockConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.core.async.SdkPublisher;
import software.amazon.awssdk.services.bedrockagentruntime.model.*;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class BedrockService {

    private static final Logger log = LoggerFactory.getLogger(BedrockService.class);
    private final BedrockConfig bedrockConfig;
    public BedrockService(BedrockConfig bedrockConfig) {
        this.bedrockConfig = bedrockConfig;
    }
    public CompletableFuture<String> invokeAgent(String inputText) {
        InvokeAgentRequest req= InvokeAgentRequest.builder()
                .agentId("N5NDKT3J5I")
                .agentAliasId("MYWIN33OEP")
                .sessionId(UUID.randomUUID().toString())
                .inputText(inputText)
                .build();

        CompletableFuture<String> responseFuture = new CompletableFuture<>();
        StringBuilder responseText = new StringBuilder();

        bedrockConfig.bedrockClient().invokeAgent(req, new InvokeAgentResponseHandler() {

            @Override
            public void responseReceived(InvokeAgentResponse invokeAgentResponse) {
                log.info("Response received from agent");
            }

            @Override
            public void onEventStream(SdkPublisher<ResponseStream> sdkPublisher) {
                sdkPublisher.subscribe(event -> {
                    if (event instanceof PayloadPart) {
                        PayloadPart payloadPart = (PayloadPart) event;
                        SdkBytes bytes = payloadPart.bytes();
                        String chunk = bytes.asString(StandardCharsets.UTF_8);
                        responseText.append(chunk);
                        log.debug("Received chunk: {}", chunk);
                    }
                });
            }

            @Override
            public void exceptionOccurred(Throwable throwable) {
                log.error("Error invoking agent", throwable);
                responseFuture.completeExceptionally(throwable);
            }

            @Override
            public void complete() {
                log.info("Agent invocation complete");
                responseFuture.complete(responseText.toString());
            }
        });

        return responseFuture;
    }
}
