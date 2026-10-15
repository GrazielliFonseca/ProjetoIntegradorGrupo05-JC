package com.projeto.integrador_jc.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.projeto.integrador_jc.model.Produto;
import com.projeto.integrador_jc.repository.ProdutoRepository;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    public Produto cadastrar(Produto produto) {
        validarNomeUnico(produto.getNome());
        if (produto.getPrudutoDisponivel() == null) {
            produto.setPrudutoDisponivel(true);
        }
        return produtoRepository.save(produto);
    }

    public Produto editar(Long id, Produto produtoAtualizado) {
        Produto produtoExistente = buscarPorId(id);

        produtoExistente.setNome(produtoAtualizado.getNome());
        produtoExistente.setDescricao(produtoAtualizado.getDescricao());
        produtoExistente.setURL(produtoAtualizado.getURL());
        produtoExistente.setPrudutoDisponivel(produtoAtualizado.getPrudutoDisponivel());

        return produtoRepository.save(produtoExistente);
    }

    public Produto alternarStatusDisponibilidade(Long id) {
        Produto produto = buscarPorId(id);
        
        boolean novoStatus = !produto.getPrudutoDisponivel();
        produto.setPrudutoDisponivel(novoStatus);

        return produtoRepository.save(produto);
    }

    public void excluir(Long id) {
        Produto produto = buscarPorId(id);
        produtoRepository.delete(produto);
    }

    public List<Produto> listar() {
        return produtoRepository.findAll();
    }

    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Produto " + id + " não encontrado."));
    }

    private void validarNomeUnico(String nome) {
        if (produtoRepository.existsByNome(nome)) {
            throw erro("Já existe um produto cadastrado com o nome " + nome + ".");
        }
    }

    private ResponseStatusException erro(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
