package com.smartcampus.dao;

import com.smartcampus.config.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Smart Campus Connect - Event DAO
 * Syllabus: Unit 7 (JDBC PreparedStatements for Campus Events)
 */
public class EventDAO {

    public static String getEventsJson() throws SQLException {
        String sql = "SELECT e.id, e.title, e.category, e.event_date, e.location, e.description, e.max_participants, " +
                     "       COUNT(er.id) AS reg_count " +
                     "FROM events e " +
                     "LEFT JOIN event_registrations er ON er.event_id = e.id " +
                     "GROUP BY e.id ORDER BY e.event_date ASC";

        StringBuilder sb = new StringBuilder("[");
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            boolean first = true;
            while (rs.next()) {
                if (!first) sb.append(",");
                sb.append(String.format(
                    "{\"id\":%d,\"title\":\"%s\",\"category\":\"%s\",\"event_date\":\"%s\",\"location\":\"%s\",\"registered_count\":%d,\"max_participants\":%d}",
                    rs.getInt("id"),
                    escape(rs.getString("title")),
                    escape(rs.getString("category")),
                    rs.getString("event_date"),
                    escape(rs.getString("location")),
                    rs.getInt("reg_count"),
                    rs.getInt("max_participants")
                ));
                first = false;
            }
        }
        sb.append("]");
        return sb.toString();
    }

    public static boolean registerStudent(int eventId, int studentId) throws SQLException {
        String sql = "INSERT INTO event_registrations (event_id, student_id) VALUES (?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, eventId);
            pstmt.setInt(2, studentId);
            return pstmt.executeUpdate() > 0;
        }
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", " ");
    }
}
