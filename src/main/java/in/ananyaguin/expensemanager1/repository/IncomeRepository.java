package in.ananyaguin.expensemanager1.repository;

import in.ananyaguin.expensemanager1.entity.IncomeEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface IncomeRepository extends JpaRepository<IncomeEntity, Long> {

    // Get all incomes for a user
    List<IncomeEntity> findByProfileIdOrderByDateDesc(Long profileId);

    // Latest 5 incomes
    List<IncomeEntity> findTop5ByProfileIdOrderByDateDesc(Long profileId);

    // Total income
    @Query("SELECT SUM(i.amount) FROM IncomeEntity i WHERE i.profile.id = :profileId")
    BigDecimal findTotalExpenseByProfileId(
            @Param("profileId") Long profileId
    );

    // Filter incomes
    List<IncomeEntity> findByProfileIdAndDateBetweenAndNameContainingIgnoreCase(
            Long profileId,
            LocalDate startDate,
            LocalDate endDate,
            String keyword,
            Sort sort
    );

    // Current month incomes
    List<IncomeEntity> findByProfileIdAndDateBetween(
            Long profileId,
            LocalDate startDate,
            LocalDate endDate
    );

    BigDecimal findTotalIncomeByProfileId(Long id);
}
