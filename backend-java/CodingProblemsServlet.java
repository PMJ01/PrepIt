package com.prepcore;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/coding-problems")
public class CodingProblemsServlet extends HttpServlet {
    private static String json(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        StringBuilder result = new StringBuilder("{\"data\":[");
        boolean first = true;

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/placement_prep_db", "root", "");
                 Statement statement = conn.createStatement();
                 ResultSet rows = statement.executeQuery(
                    "SELECT id, title, difficulty, description FROM coding_problems ORDER BY id")) {
                while (rows.next()) {
                    if (!first) result.append(",");
                    result.append("{")
                        .append("\"id\":").append(rows.getInt("id")).append(",")
                        .append("\"title\":\"").append(json(rows.getString("title"))).append("\",")
                        .append("\"difficulty\":\"").append(json(rows.getString("difficulty"))).append("\",")
                        .append("\"description\":\"").append(json(rows.getString("description"))).append("\"}");
                    first = false;
                }
            }
            result.append("]}");
            out.print(result);
        } catch (Exception error) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"" + json(error.getMessage() == null ? "Database error" : error.getMessage()) + "\"}");
        }
    }
}