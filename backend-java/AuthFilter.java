package com.prepcore;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebFilter("/api/*")
public class AuthFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try (Connection conn = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/placement_prep_db", "root", "");
                 PreparedStatement stmt = conn.prepareStatement(
                    "SELECT user_id FROM session_tokens WHERE token = ? AND expires_at > NOW()")) {
                stmt.setString(1, header.substring(7));
                try (ResultSet result = stmt.executeQuery()) {
                    if (result.next()) {
                        chain.doFilter(request, response);
                        return;
                    }
                }
            } catch (Exception ignored) {
                // The servlet still returns a clean 401 when MySQL is unavailable.
            }
        }
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType("application/json");
        res.getWriter().write("{\"error\":\"Unauthorized access\"}");
    }
}