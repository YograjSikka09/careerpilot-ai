package com.careerpilot.service;

import com.careerpilot.model.Job;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Optional TF-IDF matching service client. The local scoring engine is used when it is offline. */
@Component
public class AiMatchingClient {
    private final String baseUrl;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(2)).build();
    public AiMatchingClient(@Value("${app.ai.url:http://localhost:8001}") String baseUrl) { this.baseUrl = baseUrl; }

    public Map<Long, Integer> score(List<String> skills, List<Job> jobs) {
        try {
            StringBuilder json = new StringBuilder("{\"skills\":[");
            for (int i=0; i<skills.size(); i++) { if (i>0) json.append(','); json.append('"').append(escape(skills.get(i))).append('"'); }
            json.append("],\"jobs\":[");
            for (int i=0; i<jobs.size(); i++) {
                Job j=jobs.get(i); if (i>0) json.append(',');
                json.append("{\"jobId\":").append(j.getId()).append(",\"title\":\"").append(escape(j.getTitle()))
                    .append("\",\"requiredSkills\":\"").append(escape(j.getRequiredSkills()))
                    .append("\",\"description\":\"").append(escape(j.getDescription())).append("\"}");
            }
            json.append("]}");
            HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/match"))
                .timeout(java.time.Duration.ofSeconds(4)).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json.toString(), StandardCharsets.UTF_8)).build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) return Map.of();
            Map<Long,Integer> scores = new HashMap<>();
            Matcher matcher = Pattern.compile("\\{\\s*\"jobId\"\\s*:\\s*(\\d+)\\s*,\\s*\"score\"\\s*:\\s*(\\d+)").matcher(response.body());
            while (matcher.find()) scores.put(Long.parseLong(matcher.group(1)), Integer.parseInt(matcher.group(2)));
            return scores;
        } catch (Exception ignored) { return Map.of(); }
    }
    private static String escape(String s) { return (s == null ? "" : s).replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", " "); }
}
