package com.projeto.integrador_jc.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.projeto.integrador_jc.model.Produto;
import com.projeto.integrador_jc.service.AdminService;

@RestController
@RequestMapping("/api/admins")
public class AdminController {
    public static final String ADMIN_ID = "adminId";
    public static final String ADMIN_EMAIL = "adminEmail";

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public AdminService.LoginResponse login(@RequestBody LoginRequest request, HttpSession session) {
        AdminService.LoginResponse admin = adminService.login(request.email(), request.senha());
        session.setAttribute(ADMIN_ID, admin.id());
        session.setAttribute(ADMIN_EMAIL, admin.email());
        return admin;
    }

    @GetMapping("/session")
    public AdminService.LoginResponse session(HttpSession session) {
        return currentAdmin(session);
    }

    @PostMapping("/logout")
    public void logout(HttpSession session) {
        session.invalidate();
    }

    @GetMapping("/produtos")
    public List<Produto> listarProdutos(HttpSession session) {
        currentAdmin(session);
        return adminService.listarProdutos();
    }

    public static AdminService.LoginResponse currentAdmin(HttpSession session) {
        Object id = session.getAttribute(ADMIN_ID);
        Object email = session.getAttribute(ADMIN_EMAIL);
        if (!(id instanceof Long adminId) || !(email instanceof String adminEmail)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticação necessária.");
        }
        return new AdminService.LoginResponse(adminId, adminEmail);
    }

    public record LoginRequest(String email, String senha) { }
}
