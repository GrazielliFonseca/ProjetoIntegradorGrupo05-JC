package com.projeto.integrador_jc.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.projeto.integrador_jc.model.Admin;
import com.projeto.integrador_jc.model.Produto;
import com.projeto.integrador_jc.repository.AdminRepository;
import com.projeto.integrador_jc.repository.ProdutoRepository;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final ProdutoRepository produtoRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository, ProdutoRepository produtoRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.produtoRepository = produtoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(String email, String senha) {
        Admin admin = adminRepository.findByEmail(email)
                .filter(a -> a.getSenha() != null && passwordEncoder.matches(senha, a.getSenha()))
                .orElseThrow(() -> erro("E-mail ou senha incorretos."));

        return new LoginResponse(admin.getId(), admin.getEmail());
    }
    
    public List<Produto> listarProdutos() {
        return produtoRepository.findAll();
    }

    private ResponseStatusException erro(String mensagem) {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, mensagem);
    }

    public record LoginResponse(Long id, String email) { }
}
