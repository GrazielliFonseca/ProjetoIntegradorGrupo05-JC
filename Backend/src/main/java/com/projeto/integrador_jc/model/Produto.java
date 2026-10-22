package com.projeto.integrador_jc.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table ( name ="tb_produto")
@Getter
@Setter
@NoArgsConstructor

public class Produto{
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (nullable = false)
    private String nome;

    @Column (nullable = false, length = 5000)
    private String descricao;

    @Column (nullable = false, length = 1000000)
    private String URL;

    @Column (nullable = false)
    private Boolean prudutoDisponivel;

}
