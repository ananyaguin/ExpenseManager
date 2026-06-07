package in.ananyaguin.expensemanager1.repository;

import in.ananyaguin.expensemanager1.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

    // Get all categories of a user
    List<CategoryEntity> findByProfileId(Long profileId);

    // Get category by category id and profile id
    Optional<CategoryEntity> findByIdAndProfileId(
            Long id,
            Long profileId
    );

    // Get categories by type and profile id
    List<CategoryEntity> findByTypeAndProfileId(
            String type,
            Long profileId
    );

    // Check duplicate category name for a user
    Boolean existsByNameAndProfileId(
            String name,
            Long profileId
    );
}
