package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    boolean existsByCName(String cName);

    @Query("SELECT c FROM Category c WHERE LOWER(c.CName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Category> findByNameContainingIgnoreCase(String name);

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.products WHERE c.CId = :id")
    Category findByIdWithProducts(UUID id);
}
