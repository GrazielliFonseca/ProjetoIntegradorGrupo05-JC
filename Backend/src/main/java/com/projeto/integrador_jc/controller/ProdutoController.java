package com.projeto.integrador_jc.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

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
    public Produto cadastrar(@RequestBody Produto produto) {
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
    public Produto editar(@PathVariable Long id, @RequestBody Produto produto) {
        return produtoService.editar(id, produto);
    }

    @PatchMapping("/{id}/status")
    public Produto alternarStatus(@PathVariable Long id) {
        return produtoService.alternarStatusDisponibilidade(id);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        produtoService.excluir(id);
    }
}
