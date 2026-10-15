package com.projeto.integrador_jc.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projeto.integrador_jc.model.Admin;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    boolean existsByDocumento(String documento);

    Optional<Admin> findByEmail(String email);
}
