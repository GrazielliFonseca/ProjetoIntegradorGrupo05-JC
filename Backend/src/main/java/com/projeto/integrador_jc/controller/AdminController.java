package com.projeto.integrador_jc.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.projeto.integrador_jc.model.Admin;
import com.projeto.integrador_jc.model.Produto;
import com.projeto.integrador_jc.service.AdminService;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public Admin login(@RequestParam String email,
                       @RequestParam String senha) {
        return adminService.login(email, senha);
    }

    @GetMapping("/produtos")
    public List<Produto> listarProdutos() {
        return adminService.listarProdutos();
    }
}
