package com.projeto.integrador_jc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.projeto.integrador_jc.controller.GlobalExceptionHandler;

class GlobalExceptionHandlerTest {
    private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
            .setControllerAdvice(new GlobalExceptionHandler()).build();

    @RestController
    static class TestController {
        @GetMapping("/test/integrity")
        void integrity() { throw new DataIntegrityViolationException("SQL constraint secret"); }

        @GetMapping("/test/unauthorized")
        void unauthorized() { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "private detail"); }

        @GetMapping("/test/not-found")
        void notFound() { throw new ResponseStatusException(HttpStatus.NOT_FOUND, "private detail"); }

        @GetMapping("/test/generic")
        void generic() { throw new IllegalStateException("private stacktrace and SQL detail"); }
    }

    @Test
    void integrityViolationReturnsSafeBadRequestJson() throws Exception {
        assertSafeError("/test/integrity", 400, "inválidos");
    }

    @Test
    void responseStatusesArePreservedWithoutExposingDetails() throws Exception {
        assertSafeError("/test/unauthorized", 401, "Autenticação");
        assertSafeError("/test/not-found", 404, "não foi encontrado");
    }

    @Test
    void unexpectedErrorReturnsSafeInternalServerErrorJson() throws Exception {
        assertSafeError("/test/generic", 500, "erro interno");
    }

    private void assertSafeError(String path, int code, String messagePart) throws Exception {
        mockMvc.perform(get(path))
                .andExpect(status().is(code))
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(jsonPath("$.status").value(code))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString(messagePart)))
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("SQL"))))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("private detail"))))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("IllegalStateException"))));
    }
}
