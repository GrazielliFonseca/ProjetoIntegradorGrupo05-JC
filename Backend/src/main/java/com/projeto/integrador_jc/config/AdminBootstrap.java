package com.projeto.integrador_jc.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.projeto.integrador_jc.model.Admin;
import com.projeto.integrador_jc.repository.AdminRepository;

@Component
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AdminRepository adminRepository;
    private final String email;
    private final String password;
    private final String documento;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrap(AdminRepository adminRepository, Environment environment, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.email = environment.getProperty("JC_ADMIN_EMAIL");
        this.password = environment.getProperty("JC_ADMIN_PASSWORD");
        this.documento = environment.getProperty("JC_ADMIN_DOCUMENTO");
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        validateConfiguration();

        int migrated = 0;
        java.util.List<Admin> migratedAdmins = new java.util.ArrayList<>();
        for (Admin existing : adminRepository.findAll()) {
            String stored = existing.getSenha();
            if (stored != null && !isBcryptHash(stored)) {
                existing.setSenha(passwordEncoder.encode(stored));
                migratedAdmins.add(existing);
                migrated++;
            }
        }
        if (migrated > 0) {
            adminRepository.saveAll(migratedAdmins);
            adminRepository.flush();
        }
        logger.info("Migrated {} administrator password(s) to BCrypt", migrated);

        if (adminRepository.count() > 0) {
            return;
        }

        Admin admin = new Admin();
        admin.setEmail(email);
        admin.setSenha(passwordEncoder.encode(password));
        admin.setDocumento(documento);
        adminRepository.save(admin);
    }

    private void validateConfiguration() {
        java.util.List<String> missing = new java.util.ArrayList<>();
        if (email == null || email.isBlank()) missing.add("JC_ADMIN_EMAIL");
        if (password == null || password.isBlank()) missing.add("JC_ADMIN_PASSWORD");
        if (documento == null || documento.isBlank()) missing.add("JC_ADMIN_DOCUMENTO");
        if (!missing.isEmpty()) {
            throw new IllegalStateException("Required environment variable(s) missing or blank: " + String.join(", ", missing));
        }
    }

    private boolean isBcryptHash(String value) {
        return value.matches("\\A\\$2[aby]\\$(?:0[4-9]|[12][0-9]|3[01])\\$[./A-Za-z0-9]{53}\\z");
    }
}
