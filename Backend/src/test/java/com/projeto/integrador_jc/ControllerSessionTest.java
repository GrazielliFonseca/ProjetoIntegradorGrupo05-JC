package com.projeto.integrador_jc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.projeto.integrador_jc.controller.AdminController;
import com.projeto.integrador_jc.controller.ProdutoController;
import com.projeto.integrador_jc.service.AdminService;
import com.projeto.integrador_jc.service.ProdutoService;

class ControllerSessionTest {
    @Test
    void loginAcceptsCredentialsFromRequestBodyAndStoresIdentity() {
        AdminService service = mock(AdminService.class);
        HttpSession session = mock(HttpSession.class);
        AdminService.LoginResponse identity = new AdminService.LoginResponse(7L, "admin@example.com");
        when(service.login("admin@example.com", "secret")).thenReturn(identity);

        AdminService.LoginResponse result = new AdminController(service).login(
                new AdminController.LoginRequest("admin@example.com", "secret"), session);

        assertEquals(identity, result);
        verify(service).login("admin@example.com", "secret");
        verify(session).setAttribute(AdminController.ADMIN_ID, 7L);
        verify(session).setAttribute(AdminController.ADMIN_EMAIL, "admin@example.com");
    }

    @Test
    void sessionWithoutAdminIsUnauthorized() {
        HttpSession session = mock(HttpSession.class);
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> AdminController.currentAdmin(session));
        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
    }

    @Test
    void productWriteRequiresAdminSession() {
        ProdutoService service = mock(ProdutoService.class);
        ProdutoController controller = new ProdutoController(service);
        HttpSession session = mock(HttpSession.class);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.excluir(4L, session));

        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
        verifyNoInteractions(service);
    }

    @Test
    void logoutInvalidatesSession() {
        HttpSession session = mock(HttpSession.class);
        new AdminController(mock(AdminService.class)).logout(session);
        verify(session).invalidate();
    }
}
