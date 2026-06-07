package in.ananyaguin.expensemanager1.repository;

import in.ananyaguin.expensemanager1.entity.ExpenseEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long> {

    // Get all expenses for a user
    List<ExpenseEntity> findByProfileIdOrderByDateDesc(Long profileId);

    // Latest 5 expenses
    List<ExpenseEntity> findTop5ByProfileIdOrderByDateDesc(Long profileId);

    // Total expense
    @Query("SELECT SUM(e.amount) FROM ExpenseEntity e WHERE e.profile.id = :profileId")
    BigDecimal findTotalExpenseByProfileId(
            @Param("profileId") Long profileId
    );

    // Filter expenses
    List<ExpenseEntity> findByProfileIdAndDateBetweenAndNameContainingIgnoreCase(
            Long profileId,
            LocalDate startDate,
            LocalDate endDate,
            String keyword,
            Sort sort
    );

    // Current month expenses
    List<ExpenseEntity> findByProfileIdAndDateBetween(
            Long profileId,
            LocalDate startDate,
            LocalDate endDate
    );

    // Expenses on a specific date
    List<ExpenseEntity> findByProfileIdAndDate(
            Long profileId,
            LocalDate date
    );
}