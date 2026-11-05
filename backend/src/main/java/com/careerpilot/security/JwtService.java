package com.careerpilot.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class JwtService {
    private final String secret;
    private final long expirationHours;
    private final Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
    private final Base64.Decoder decoder = Base64.getUrlDecoder();

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-hours:24}") long expirationHours) {
        this.secret = secret;
        this.expirationHours = expirationHours;
    }

    public String create(String email, String role) {
        long now = Instant.now().getEpochSecond();
        String header = encoder.encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String payloadJson = "{\"sub\":\"" + escape(email) + "\",\"role\":\"" + role + "\",\"iat\":" + now + ",\"exp\":" + (now + expirationHours * 3600) + "}";
        String payload = encoder.encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        String unsigned = header + "." + payload;
        return unsigned + "." + sign(unsigned);
    }

    public Claims verify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return null;
            String unsigned = parts[0] + "." + parts[1];
            if (!java.security.MessageDigest.isEqual(sign(unsigned).getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) return null;
            String json = new String(decoder.decode(parts[1]), StandardCharsets.UTF_8);
            String subject = extract(json, "sub");
            String role = extract(json, "role");
            Matcher expMatcher = Pattern.compile("\\\"exp\\\":(\\d+)").matcher(json);
            if (subject == null || role == null || !expMatcher.find() || Long.parseLong(expMatcher.group(1)) < Instant.now().getEpochSecond()) return null;
            return new Claims(subject, role);
        } catch (Exception ex) { return null; }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return encoder.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) { throw new IllegalStateException("Unable to sign access token", ex); }
    }
    private static String extract(String json, String key) {
        Matcher matcher = Pattern.compile("\\\"" + key + "\\\":\\\"((?:\\\\.|[^\\\"])*)\\\"").matcher(json);
        return matcher.find() ? matcher.group(1).replace("\\\"", "\"").replace("\\\\", "\\") : null;
    }
    private static String escape(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\""); }
    public record Claims(String email, String role) {}
}
