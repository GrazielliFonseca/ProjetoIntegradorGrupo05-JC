package com.projeto.integrador_jc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.projeto.integrador_jc.controller.AdminPageController;

class AdminPageControllerTest {

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new AdminPageController())
            .build();

    @Test
    void adminForwardsToIndexHtml() throws Exception {
        mockMvc.perform(get("/admin"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }
}
