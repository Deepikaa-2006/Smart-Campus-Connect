package com.smartcampus.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Smart Campus Connect - Database Connection Manager
 * Syllabus: Unit 7 (Java Database Connectivity - JDBC)
 */
public class DBConnection {

    private static final String URL = "jdbc:mysql://127.0.0.1:3306/smart_campus_connect?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String USER = "root";
    private static final String PASSWORD = "";

    static {
        try {
            // Load MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[JDBC Error] MySQL Driver not found in classpath: " + e.getMessage());
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("[JDBC Test Failed]: " + e.getMessage());
            return false;
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Testing MySQL JDBC Connection ===");
        boolean success = testConnection();
        if (success) {
            System.out.println("[PASS] Successfully connected to MySQL database 'smart_campus_connect' via JDBC!");
        } else {
            System.err.println("[FAIL] Could not connect to MySQL database.");
            System.exit(1);
        }
    }
}
