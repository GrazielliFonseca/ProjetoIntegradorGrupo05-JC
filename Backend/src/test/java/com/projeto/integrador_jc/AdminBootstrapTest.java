package com.projeto.integrador_jc;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.projeto.integrador_jc.config.AdminBootstrap;
import com.projeto.integrador_jc.model.Admin;
import com.projeto.integrador_jc.repository.AdminRepository;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapTest {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private Environment environment;

    @Captor
    private ArgumentCaptor<List<Admin>> savedAdmins;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    private AdminBootstrap bootstrap(String email, String password, String documento) {
        when(environment.getProperty("JC_ADMIN_EMAIL")).thenReturn(email);
        when(environment.getProperty("JC_ADMIN_PASSWORD")).thenReturn(password);
        when(environment.getProperty("JC_ADMIN_DOCUMENTO")).thenReturn(documento);
        return new AdminBootstrap(adminRepository, environment, encoder);
    }

    @Test
    void seedsAdminWhenTableIsEmpty() {
        when(adminRepository.count()).thenReturn(0L);
        AdminBootstrap bootstrap = bootstrap("demo@example.invalid", "demo-secret", "DEMO-1");

        bootstrap.run();

        org.mockito.ArgumentCaptor<Admin> savedAdmin = org.mockito.ArgumentCaptor.forClass(Admin.class);
        verify(adminRepository).save(savedAdmin.capture());
        org.junit.jupiter.api.Assertions.assertEquals("demo@example.invalid", savedAdmin.getValue().getEmail());
        org.junit.jupiter.api.Assertions.assertTrue(encoder.matches("demo-secret", savedAdmin.getValue().getSenha()));
        org.junit.jupiter.api.Assertions.assertEquals("DEMO-1", savedAdmin.getValue().getDocumento());
    }

    @Test
    void leavesExistingAdminsUntouchedAndDoesNotReseed() {
        when(adminRepository.count()).thenReturn(1L);
        AdminBootstrap bootstrap = bootstrap("new@example.invalid", "new-secret", "NEW-1");

        bootstrap.run();
        bootstrap.run();

        verify(adminRepository, never()).save(org.mockito.ArgumentMatchers.any(Admin.class));
    }

    @Test
    void rejectsMissingEnvironmentValuesBeforeDatabaseChanges() {
        AdminBootstrap bootstrap = bootstrap(" ", "secret", "DOC");
        org.junit.jupiter.api.Assertions.assertTrue(org.junit.jupiter.api.Assertions
                .assertThrows(IllegalStateException.class, bootstrap::run).getMessage().contains("JC_ADMIN_EMAIL"));
        verify(adminRepository, never()).findAll();
        verify(adminRepository, never()).count();
    }

    @Test
    void migratesPlaintextPasswordsOnlyOnce() {
        Admin old = new Admin();
        old.setSenha("legacy-secret");
        when(adminRepository.findAll()).thenReturn(List.of(old));
        when(adminRepository.count()).thenReturn(1L);
        AdminBootstrap bootstrap = bootstrap("email", "secret", "doc");
        bootstrap.run();
        String hash = old.getSenha();
        bootstrap.run();
        org.junit.jupiter.api.Assertions.assertTrue(encoder.matches("legacy-secret", hash));
        org.junit.jupiter.api.Assertions.assertEquals(hash, old.getSenha());
        verify(adminRepository).saveAll(savedAdmins.capture());
        org.junit.jupiter.api.Assertions.assertEquals(1, savedAdmins.getValue().size());
        org.junit.jupiter.api.Assertions.assertEquals(hash, savedAdmins.getValue().get(0).getSenha());
        verify(adminRepository, org.mockito.Mockito.times(1)).flush();
    }
}
