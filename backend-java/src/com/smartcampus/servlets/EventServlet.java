package com.smartcampus.servlets;

import com.smartcampus.dao.EventDAO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Smart Campus Connect - Event Servlet
 * Syllabus: Unit 6 (Java Servlets Request Handling)
 */
public class EventServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        try (PrintWriter out = resp.getWriter()) {
            String eventsJson = EventDAO.getEventsJson();
            out.print(String.format("{\"success\":true,\"servlet\":\"EventServlet\",\"events\":%s}", eventsJson));
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

        int eventId = Integer.parseInt(req.getParameter("event_id"));
        int studentId = Integer.parseInt(req.getParameter("student_id"));

        try (PrintWriter out = resp.getWriter()) {
            boolean registered = EventDAO.registerStudent(eventId, studentId);
            out.print(String.format("{\"success\":%b,\"message\":\"Student registered for event via Java Servlet\"}", registered));
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            try (PrintWriter out = resp.getWriter()) {
                out.print("{\"success\":false,\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }
}
