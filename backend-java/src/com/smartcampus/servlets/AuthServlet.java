package com.smartcampus.servlets;

import com.smartcampus.config.DBConnection;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * Smart Campus Connect - Auth Servlet with Session Management
 * Syllabus: Unit 6 (Java Servlets Request Handling & HttpSession Management)
 */
public class AuthServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        HttpSession session = req.getSession(false);
        try (PrintWriter out = resp.getWriter()) {
            if (session != null && session.getAttribute("username") != null) {
                out.print(String.format(
                    "{\"authenticated\":true,\"username\":\"%s\",\"role\":\"%s\",\"userId\":%d}",
                    session.getAttribute("username"),
                    session.getAttribute("role"),
                    session.getAttribute("userId")
                ));
            } else {
                out.print("{\"authenticated\":false,\"message\":\"No active Servlet HttpSession\"}");
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        String username = req.getParameter("username");
        String action = req.getParameter("action");

        try (PrintWriter out = resp.getWriter()) {
            if ("logout".equalsIgnoreCase(action)) {
                HttpSession session = req.getSession(false);
                if (session != null) {
                    session.invalidate();
                }
                out.print("{\"success\":true,\"message\":\"Servlet session invalidated\"}");
                return;
            }

            if (username == null || username.isEmpty()) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\":false,\"message\":\"Username is required\"}");
                return;
            }

            // Prepared statement query
            String sql = "SELECT id, username, role, full_name FROM users WHERE username = ? LIMIT 1";
            try (Connection conn = DBConnection.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql)) {

                pstmt.setString(1, username);
                try (ResultSet rs = pstmt.executeQuery()) {
                    if (rs.next()) {
                        HttpSession session = req.getSession(true);
                        session.setAttribute("userId", rs.getInt("id"));
                        session.setAttribute("username", rs.getString("username"));
                        session.setAttribute("role", rs.getString("role"));
                        session.setAttribute("fullName", rs.getString("full_name"));

                        out.print(String.format(
                            "{\"success\":true,\"message\":\"HttpSession established successfully\",\"sessionId\":\"%s\",\"user\":{\"id\":%d,\"username\":\"%s\",\"role\":\"%s\",\"full_name\":\"%s\"}}",
                            session.getId(),
                            rs.getInt("id"),
                            rs.getString("username"),
                            rs.getString("role"),
                            rs.getString("full_name")
                        ));
                    } else {
                        resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        out.print("{\"success\":false,\"message\":\"User not found in campus database\"}");
                    }
                }
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            try (PrintWriter out = resp.getWriter()) {
                out.print("{\"success\":false,\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }
}
