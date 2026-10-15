package com.projeto.integrador_jc;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
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

import com.projeto.integrador_jc.model.Produto;
import com.projeto.integrador_jc.repository.ProdutoRepository;
import com.projeto.integrador_jc.service.ProdutoService;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProdutoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @InjectMocks
    private ProdutoService produtoService;

    // Subclasse concreta para instanciar a classe abstrata Produto no teste
    static class ProdutoConcreto extends Produto {
        public ProdutoConcreto(Long id, String nome, String descricao, String url, Boolean disponivel) {
            setId(id);
            setNome(nome);
            setDescricao(descricao);
            setURL(url);
            setPrudutoDisponivel(disponivel);
        }
    }

    @BeforeEach
    void salvarDevolveAProprioProduto() {
        when(produtoRepository.save(any(Produto.class))).thenAnswer(chamada -> chamada.getArgument(0));
    }

    @Test
    @DisplayName("cadastrar produto com nome unico define status disponivel true por padrao")
    void cadastrarProdutoComSucesso() {
        when(produtoRepository.existsByNome("Mangueira")).thenReturn(false);

        Produto novoProduto = new ProdutoConcreto(null, "Mangueira", "Alta pressao", "url.com", null);
        Produto salvo = produtoService.cadastrar(novoProduto);

        assertEquals("Mangueira", salvo.getNome());
        assertTrue(salvo.getPrudutoDisponivel());
    }

    @Test
    @DisplayName("nao deixa cadastrar produto com nome duplicado")
    void cadastrarProdutoNomeDuplicado() {
        when(produtoRepository.existsByNome("Mangueira")).thenReturn(true);

        Produto produtoDuplicado = new ProdutoConcreto(null, "Mangueira", "Outra descricao", "url.com", true);

        ResponseStatusException erro = assertThrows(ResponseStatusException.class,
                () -> produtoService.cadastrar(produtoDuplicado));

        assertEquals(HttpStatus.BAD_REQUEST, erro.getStatusCode());
    }

    @Test
    @DisplayName("alternar status de disponibilidade inverte o valor atual")
    void alternarStatusDisponibilidade() {
        Produto produto = new ProdutoConcreto(1L, "Conexao", "Inox", "url.com", true);
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        Produto atualizado = produtoService.alternarStatusDisponibilidade(1L);

        assertFalse(atualizado.getPrudutoDisponivel());
    }

    @Test
    @DisplayName("produto inexistente ao buscar devolve 404")
    void produtoInexistente() {
        when(produtoRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException erro = assertThrows(ResponseStatusException.class,
                () -> produtoService.buscarPorId(99L));

        assertEquals(HttpStatus.NOT_FOUND, erro.getStatusCode());
    }
}