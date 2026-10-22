package com.projeto.integrador_jc;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.projeto.integrador_jc.repository.AdminRepository;
import com.projeto.integrador_jc.model.Produto;
import com.projeto.integrador_jc.repository.ProdutoRepository;

@SpringBootTest
class IntegradorJcApplicationTests {

	@Autowired
	private AdminRepository adminRepository;

	@Autowired
	private ProdutoRepository produtoRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void bootstrapsDemoAdminWhenDatabaseIsEmpty() {
		assertTrue(adminRepository.findByEmail("demo-admin@localhost.invalid").isPresent());
	}

	@Test
	void savesProductDescriptionsLongerThan255Characters() {
		Produto produto = new Produto();
		produto.setNome("Descrição longa de teste");
		produto.setDescricao("d".repeat(373));
		produto.setURL("/imagens/logo-jc.png");
		produto.setPrudutoDisponivel(true);

		Produto salvo = produtoRepository.saveAndFlush(produto);

		assertEquals(373, salvo.getDescricao().length());
	}

}
