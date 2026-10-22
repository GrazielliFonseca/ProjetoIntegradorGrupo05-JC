package com.projeto.integrador_jc.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.projeto.integrador_jc.model.Admin;
import com.projeto.integrador_jc.repository.AdminRepository;

@Component
public class AdminBootstrap implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final String email;
    private final String password;
    private final String documento;

    public AdminBootstrap(AdminRepository adminRepository,
            @Value("${app.admin.email}") String email,
            @Value("${app.admin.password}") String password,
            @Value("${app.admin.documento}") String documento) {
        this.adminRepository = adminRepository;
        this.email = email;
        this.password = password;
        this.documento = documento;
    }

    @Override
    public void run(String... args) {
        if (adminRepository.count() > 0) {
            return;
        }

        Admin admin = new Admin();
        admin.setEmail(email);
        admin.setSenha(password);
        admin.setDocumento(documento);
        adminRepository.save(admin);
    }
}
