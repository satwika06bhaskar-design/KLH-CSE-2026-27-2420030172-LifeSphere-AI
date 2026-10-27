package com.lifesphere.backend;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        System.out.println(
                "JWT FILTER -> " +
                request.getMethod() +
                " " +
                request.getRequestURI()
        );

        System.out.println(
                "AUTH HEADER PRESENT -> " +
                (authHeader != null)
        );

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println("JWT FILTER -> NO TOKEN");

            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {

            boolean valid = jwtService.isTokenValid(token);

            System.out.println(
                    "JWT FILTER -> TOKEN VALID -> " + valid
            );

            if (valid) {

                String email = jwtService.extractEmail(token);

                System.out.println(
                        "JWT FILTER -> AUTHENTICATED USER -> " + email
                );

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of(
                                        new SimpleGrantedAuthority(
                                                "ROLE_USER")));

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                System.out.println(
                        "JWT FILTER -> SECURITY CONTEXT SET"
                );

            } else {

                System.out.println(
                        "JWT FILTER -> TOKEN INVALID"
                );
            }

        } catch (Exception e) {

            System.out.println(
                    "JWT FILTER -> JWT ERROR -> " +
                    e.getClass().getName() +
                    " -> " +
                    e.getMessage()
            );

            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }
}