package com.projeto.integrador_jc.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

import com.projeto.integrador_jc.model.Produto;
import com.projeto.integrador_jc.service.ProdutoService;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @PostMapping
    public Produto cadastrar(@RequestBody Produto produto, HttpSession session) {
        AdminController.currentAdmin(session);
        return produtoService.cadastrar(produto);
    }

    @GetMapping
    public List<Produto> listar() {
        return produtoService.listar();
    }

    @GetMapping("/{id}")
    public Produto buscar(@PathVariable Long id) {
        return produtoService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public Produto editar(@PathVariable Long id, @RequestBody Produto produto, HttpSession session) {
        AdminController.currentAdmin(session);
        return produtoService.editar(id, produto);
    }

    @PatchMapping("/{id}/status")
    public Produto alternarStatus(@PathVariable Long id, HttpSession session) {
        AdminController.currentAdmin(session);
        return produtoService.alternarStatusDisponibilidade(id);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id, HttpSession session) {
        AdminController.currentAdmin(session);
        produtoService.excluir(id);
    }
}
