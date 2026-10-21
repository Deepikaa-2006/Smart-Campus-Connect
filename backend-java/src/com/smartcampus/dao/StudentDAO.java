package com.smartcampus.dao;

import com.smartcampus.config.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Smart Campus Connect - Student DAO
 * Syllabus: Unit 7 (JDBC PreparedStatements & Database Operations)
 */
public class StudentDAO {

    public static String getStudentProfileJson(int studentId) throws SQLException {
        String sql = "SELECT s.id AS student_id, s.roll_number, s.department, s.semester, s.cgpa, s.phone, " +
                     "       u.full_name, u.email " +
                     "FROM students s " +
                     "JOIN users u ON s.user_id = u.id " +
                     "WHERE s.id = ? LIMIT 1";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, studentId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return String.format(
                        "{\"student_id\":%d,\"roll_number\":\"%s\",\"full_name\":\"%s\",\"email\":\"%s\",\"department\":\"%s\",\"semester\":%d,\"cgpa\":%.2f,\"phone\":\"%s\"}",
                        rs.getInt("student_id"),
                        rs.getString("roll_number"),
                        rs.getString("full_name"),
                        rs.getString("email"),
                        rs.getString("department"),
                        rs.getInt("semester"),
                        rs.getDouble("cgpa"),
                        rs.getString("phone") != null ? rs.getString("phone") : ""
                    );
                }
            }
        }
        return "{}";
    }

    public static String getStudentRosterJson(String department, int semester) throws SQLException {
        String sql = "SELECT s.id AS student_id, s.roll_number, u.full_name, u.email " +
                     "FROM students s " +
                     "JOIN users u ON s.user_id = u.id " +
                     "WHERE s.department = ? AND s.semester = ? " +
                     "ORDER BY s.roll_number ASC";

        StringBuilder sb = new StringBuilder("[");
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, department);
            pstmt.setInt(2, semester);
            try (ResultSet rs = pstmt.executeQuery()) {
                boolean first = true;
                while (rs.next()) {
                    if (!first) sb.append(",");
                    sb.append(String.format(
                        "{\"student_id\":%d,\"roll_number\":\"%s\",\"full_name\":\"%s\",\"email\":\"%s\"}",
                        rs.getInt("student_id"),
                        rs.getString("roll_number"),
                        rs.getString("full_name"),
                        rs.getString("email")
                    ));
                    first = false;
                }
            }
        }
        sb.append("]");
        return sb.toString();
    }
}
