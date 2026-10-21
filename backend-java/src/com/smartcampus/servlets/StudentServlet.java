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
 * Smart Campus Connect - Student Servlet
 * Syllabus: Unit 6 (Java Servlets Request Handling & Lifecycle)
 */
public class StudentServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        String idParam = req.getParameter("id");
        int studentId = (idParam != null && !idParam.isEmpty()) ? Integer.parseInt(idParam) : 1;

        try (PrintWriter out = resp.getWriter()) {
            String profileJson = StudentDAO.getStudentProfileJson(studentId);
            String attJson = AttendanceDAO.getAttendanceSummaryJson(studentId);

            String combinedResponse = String.format(
                "{\"success\":true,\"servlet\":\"StudentServlet (Unit 6)\",\"profile\":%s,\"attendance\":%s}",
                profileJson, attJson
            );
            out.print(combinedResponse);
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            try (PrintWriter out = resp.getWriter()) {
                out.print("{\"success\":false,\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }
}
