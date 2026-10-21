package com.smartcampus.dao;

import com.smartcampus.config.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Smart Campus Connect - Attendance DAO
 * Syllabus: Unit 7 (JDBC PreparedStatements for Attendance Recording)
 */
public class AttendanceDAO {

    public static boolean recordAttendance(int studentId, int facultyId, String subject, String date, String status, String remarks) throws SQLException {
        String sql = "INSERT INTO attendance (student_id, faculty_id, subject, attendance_date, status, remarks) " +
                     "VALUES (?, ?, ?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, studentId);
            pstmt.setInt(2, facultyId);
            pstmt.setString(3, subject);
            pstmt.setString(4, date);
            pstmt.setString(5, status);
            pstmt.setString(6, remarks);

            int rows = pstmt.executeUpdate();
            return rows > 0;
        }
    }

    public static String getAttendanceSummaryJson(int studentId) throws SQLException {
        String sql = "SELECT COUNT(*) AS total, " +
                     "       SUM(CASE WHEN status IN ('Present', 'Late') THEN 1 ELSE 0 END) AS attended " +
                     "FROM attendance WHERE student_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, studentId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    int total = rs.getInt("total");
                    int attended = rs.getInt("attended");
                    double pct = total > 0 ? ((double) attended / total) * 100.0 : 0.0;
                    return String.format(
                        "{\"total_classes\":%d,\"attended_classes\":%d,\"percentage\":%.1f,\"status\":\"%s\"}",
                        total, attended, pct, pct >= 75.0 ? "Eligible" : "Attendance Shortage"
                    );
                }
            }
        }
        return "{\"total_classes\":0,\"attended_classes\":0,\"percentage\":0.0,\"status\":\"No Records\"}";
    }
}
