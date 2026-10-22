package com.projeto.integrador_jc;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.projeto.integrador_jc.config.AdminBootstrap;
import com.projeto.integrador_jc.model.Admin;
import com.projeto.integrador_jc.repository.AdminRepository;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapTest {

    @Mock
    private AdminRepository adminRepository;

    @Test
    void seedsAdminWhenTableIsEmpty() {
        when(adminRepository.count()).thenReturn(0L);
        AdminBootstrap bootstrap = new AdminBootstrap(adminRepository, "demo@example.invalid", "demo-secret", "DEMO-1");

        bootstrap.run();

        org.mockito.ArgumentCaptor<Admin> savedAdmin = org.mockito.ArgumentCaptor.forClass(Admin.class);
        verify(adminRepository).save(savedAdmin.capture());
        org.junit.jupiter.api.Assertions.assertEquals("demo@example.invalid", savedAdmin.getValue().getEmail());
        org.junit.jupiter.api.Assertions.assertEquals("demo-secret", savedAdmin.getValue().getSenha());
        org.junit.jupiter.api.Assertions.assertEquals("DEMO-1", savedAdmin.getValue().getDocumento());
    }

    @Test
    void leavesExistingAdminsUntouchedAndDoesNotReseed() {
        when(adminRepository.count()).thenReturn(1L);
        AdminBootstrap bootstrap = new AdminBootstrap(adminRepository, "new@example.invalid", "new-secret", "NEW-1");

        bootstrap.run();
        bootstrap.run();

        verify(adminRepository, never()).save(org.mockito.ArgumentMatchers.any(Admin.class));
    }
}
