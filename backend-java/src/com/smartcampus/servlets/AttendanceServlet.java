package com.smartcampus.servlets;

import com.smartcampus.dao.AttendanceDAO;
import com.smartcampus.dao.StudentDAO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Smart Campus Connect - Attendance Servlet
 * Syllabus: Unit 6 (Java Servlets Request Handling) & Unit 7 (JDBC)
 */
public class AttendanceServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        String dept = req.getParameter("department");
        if (dept == null || dept.isEmpty()) dept = "Computer Science & Engineering";
        String semParam = req.getParameter("semester");
        int sem = (semParam != null && !semParam.isEmpty()) ? Integer.parseInt(semParam) : 6;

        try (PrintWriter out = resp.getWriter()) {
            String rosterJson = StudentDAO.getStudentRosterJson(dept, sem);
            out.print(String.format("{\"success\":true,\"servlet\":\"AttendanceServlet\",\"roster\":%s}", rosterJson));
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            try (PrintWriter out = resp.getWriter()) {
                out.print("{\"success\":false,\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        int studentId = Integer.parseInt(req.getParameter("student_id"));
        int facultyId = Integer.parseInt(req.getParameter("faculty_id"));
        String subject = req.getParameter("subject");
        String date = req.getParameter("date");
        String status = req.getParameter("status");
        String remarks = req.getParameter("remarks");

        try (PrintWriter out = resp.getWriter()) {
            boolean saved = AttendanceDAO.recordAttendance(studentId, facultyId, subject, date, status, remarks);
            out.print(String.format("{\"success\":%b,\"message\":\"Attendance recorded via Java Servlet & JDBC PreparedStatement\"}", saved));
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            try (PrintWriter out = resp.getWriter()) {
                out.print("{\"success\":false,\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }
}
