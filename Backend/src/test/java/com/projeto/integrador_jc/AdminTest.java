package com.projeto.integrador_jc;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.projeto.integrador_jc.model.Admin;
import com.projeto.integrador_jc.repository.AdminRepository;
import com.projeto.integrador_jc.repository.ProdutoRepository;
import com.projeto.integrador_jc.service.AdminService;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AdminServiceTest {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @InjectMocks
    private AdminService adminService;

    // Subclasse concreta para instanciar a classe abstrata Admin no teste
    static class AdminConcreto extends Admin {
        public AdminConcreto(String email, String senha) {
            setEmail(email);
            setSenha(senha);
        }
    }

    @Test
    @DisplayName("login com credenciais corretas retorna o admin")
    void loginSucesso() {
        Admin adminMock = new AdminConcreto("admin@jchidraulica.com", "123456");
        when(adminRepository.findByEmail("admin@jchidraulica.com")).thenReturn(Optional.of(adminMock));

        Admin adminLogado = adminService.login("admin@jchidraulica.com", "123456");

        assertNotNull(adminLogado);
        assertEquals("admin@jchidraulica.com", adminLogado.getEmail());
    }

    @Test
    @DisplayName("login com senha ou email incorretos lanca excecao generica 400")
    void loginInvalido() {
        Admin adminMock = new AdminConcreto("admin@jchidraulica.com", "123456");
        when(adminRepository.findByEmail("admin@jchidraulica.com")).thenReturn(Optional.of(adminMock));

        // Testando senha incorreta
        ResponseStatusException erroSenha = assertThrows(ResponseStatusException.class,
                () -> adminService.login("admin@jchidraulica.com", "senhaerrada"));
        assertEquals(HttpStatus.BAD_REQUEST, erroSenha.getStatusCode());
        assertEquals("400 BAD_REQUEST \"E-mail ou senha incorretos.\"", erroSenha.getMessage());

        // Testando e-mail inexistente
        when(adminRepository.findByEmail("inexistente@email.com")).thenReturn(Optional.empty());
        ResponseStatusException erroEmail = assertThrows(ResponseStatusException.class,
                () -> adminService.login("inexistente@email.com", "123456"));
        assertEquals(HttpStatus.BAD_REQUEST, erroEmail.getStatusCode());
        assertEquals("400 BAD_REQUEST \"E-mail ou senha incorretos.\"", erroEmail.getMessage());
    }
}
