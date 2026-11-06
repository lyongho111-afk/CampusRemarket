package com.campus.remarket.controller;
import java.util.Map;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@Order(0)
@RestControllerAdvice(assignableTypes={MemberProfileApiController.class,EngagementController.class,TradeReviewApiController.class,LocationController.class,AccountController.class,ProductApiController.class,BoardApiController.class,TradeApiController.class,ShopApiController.class,IntegrationApiController.class,MannerRatingApiController.class,com.campus.remarket.notification.NotificationController.class})
public class ApiErrorAdvice {
    @ExceptionHandler({IllegalArgumentException.class,IllegalStateException.class})
    public ResponseEntity<Map<String,String>> invalid(RuntimeException error){return ResponseEntity.badRequest().body(Map.of("message",error.getMessage()));}
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String,String>> status(ResponseStatusException error){return ResponseEntity.status(error.getStatusCode()).body(Map.of("message",error.getReason()==null?"요청을 처리하지 못했습니다.":error.getReason()));}
}
