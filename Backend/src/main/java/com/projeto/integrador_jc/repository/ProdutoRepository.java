package com.projeto.integrador_jc.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projeto.integrador_jc.model.Produto;

import java.util.Optional;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    boolean existsByNome(String nome);

    Optional<Produto> findByNome(String nome);

    List<Produto> findByProdutoDisponivel(Boolean produtoDisponivel);
}