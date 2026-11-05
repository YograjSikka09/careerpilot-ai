package com.careerpilot.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String,Object>> badRequest(IllegalArgumentException ex) { return response(HttpStatus.BAD_REQUEST,ex.getMessage()); }
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String,Object>> forbidden(AccessDeniedException ex) { return response(HttpStatus.FORBIDDEN,ex.getMessage()); }
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String,Object>> unauthorized(IllegalStateException ex) { return response(HttpStatus.UNAUTHORIZED,ex.getMessage()); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException ex) {
        String message=ex.getBindingResult().getFieldErrors().stream().map(e->e.getField()+": "+e.getDefaultMessage()).findFirst().orElse("Please check the submitted fields.");
        return response(HttpStatus.BAD_REQUEST,message);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> unexpected(Exception ex) {
        return response(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage() != null && !ex.getMessage().isBlank() ? ex.getMessage() : "Something went wrong. Please try again.");
    }
    private ResponseEntity<Map<String,Object>> response(HttpStatus status,String message) {
        Map<String,Object> body=new LinkedHashMap<>(); body.put("timestamp",Instant.now()); body.put("status",status.value()); body.put("error",message);
        return ResponseEntity.status(status).body(body);
    }
}
