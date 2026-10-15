package com.projeto.integrador_jc.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.projeto.integrador_jc.model.Admin;
import com.projeto.integrador_jc.model.Produto;
import com.projeto.integrador_jc.repository.AdminRepository;
import com.projeto.integrador_jc.repository.ProdutoRepository;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final ProdutoRepository produtoRepository;

    public AdminService(AdminRepository adminRepository, ProdutoRepository produtoRepository) {
        this.adminRepository = adminRepository;
        this.produtoRepository = produtoRepository;
    }

    public Admin login(String email, String senha) {
        Admin admin = adminRepository.findByEmail(email)
                .filter(a -> a.getSenha().equals(senha))
                .orElseThrow(() -> erro("E-mail ou senha incorretos."));

        return admin;
    }
    
    public List<Produto> listarProdutos() {
        return produtoRepository.findAll();
    }

    private ResponseStatusException erro(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}