package com.smartcampus.server;

import com.smartcampus.config.DBConnection;
import com.smartcampus.dao.AttendanceDAO;
import com.smartcampus.dao.EventDAO;
import com.smartcampus.dao.StudentDAO;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

/**
 * Smart Campus Connect - Standalone Java Servlet & JDBC Runner
 * Syllabus: Unit 6 (Java Servlets Request Handling) & Unit 7 (JDBC Database Connectivity)
 *
 * Runs an embedded HTTP server directly with standard OpenJDK without requiring Tomcat installation.
 */
public class StandaloneServletRunner {

    private static final int PORT = 8080;

    public static void main(String[] args) {
        System.out.println("=========================================================");
        System.out.println(" Smart Campus Connect - Java Servlets & JDBC Engine");
        System.out.println(" Syllabus: Unit 6 (Java Servlets) & Unit 7 (JDBC)");
        System.out.println("=========================================================");

        // Test MySQL JDBC connection first
        System.out.print("[1/2] Testing MySQL JDBC Connection... ");
        if (DBConnection.testConnection()) {
            System.out.println("CONNECTED to smart_campus_connect!");
        } else {
            System.err.println("FAILED! Ensure MySQL is running on localhost:3306.");
            return;
        }

        try {
            System.out.print("[2/2] Initializing Embedded HTTP Server on port " + PORT + "... ");
            HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

            // Register handlers replicating the Servlets
            server.createContext("/api/student", new StudentHandler());
            server.createContext("/api/attendance", new AttendanceHandler());
            server.createContext("/api/events", new EventHandler());
            server.createContext("/api/health", new HealthHandler());

            server.setExecutor(null); // default executor
            server.start();

            System.out.println("STARTED SUCCESSFULLY!");
            System.out.println("\nAvailable Java Endpoints:");
            System.out.println(" - http://localhost:" + PORT + "/api/student?id=1");
            System.out.println(" - http://localhost:" + PORT + "/api/attendance?semester=6");
            System.out.println(" - http://localhost:" + PORT + "/api/events");
            System.out.println(" - http://localhost:" + PORT + "/api/health");
            System.out.println("\nPress Ctrl+C to terminate the Java service.");

        } catch (IOException e) {
            System.err.println("Failed to start server: " + e.getMessage());
        }
    }

    static class StudentHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            try {
                String query = exchange.getRequestURI().getQuery();
                int studentId = 1;
                if (query != null && query.contains("id=")) {
                    for (String param : query.split("&")) {
                        if (param.startsWith("id=")) {
                            studentId = Integer.parseInt(param.substring(3));
                        }
                    }
                }

                String profileJson = StudentDAO.getStudentProfileJson(studentId);
                String attJson = AttendanceDAO.getAttendanceSummaryJson(studentId);
                String json = String.format("{\"success\":true,\"engine\":\"Java Servlet JDBC Engine\",\"profile\":%s,\"attendance\":%s}", profileJson, attJson);

                sendJsonResponse(exchange, 200, json);
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, "{\"success\":false,\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    static class AttendanceHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            try {
                String rosterJson = StudentDAO.getStudentRosterJson("Computer Science & Engineering", 6);
                String json = String.format("{\"success\":true,\"engine\":\"Java Servlet AttendanceDAO\",\"roster\":%s}", rosterJson);
                sendJsonResponse(exchange, 200, json);
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, "{\"success\":false,\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    static class EventHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            try {
                String eventsJson = EventDAO.getEventsJson();
                String json = String.format("{\"success\":true,\"engine\":\"Java Servlet EventDAO\",\"events\":%s}", eventsJson);
                sendJsonResponse(exchange, 200, json);
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, "{\"success\":false,\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            boolean dbOk = DBConnection.testConnection();
            String json = String.format("{\"status\":\"%s\",\"jdbc_connected\":%b,\"port\":%d,\"java_version\":\"%s\"}",
                dbOk ? "UP" : "DOWN", dbOk, PORT, System.getProperty("java.version"));
            sendJsonResponse(exchange, dbOk ? 200 : 503, json);
        }
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String responseText) throws IOException {
        byte[] bytes = responseText.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
