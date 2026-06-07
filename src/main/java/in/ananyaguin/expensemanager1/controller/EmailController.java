package in.ananyaguin.expensemanager1.controller;

import in.ananyaguin.expensemanager1.entity.ProfileEntity;
import in.ananyaguin.expensemanager1.service.EmailService;
import in.ananyaguin.expensemanager1.service.ExcelService;
import in.ananyaguin.expensemanager1.service.ExpenseService;
import in.ananyaguin.expensemanager1.service.IncomeService;
import in.ananyaguin.expensemanager1.service.ProfileService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
public class EmailController {

    private final ExcelService excelService;
    private final IncomeService incomeService;
    private final ExpenseService expenseService;
    private final EmailService emailService;
    private final ProfileService profileService;

    @GetMapping("/income-excel")
    public ResponseEntity<Void> emailIncomeExcel() throws IOException, MessagingException {

        ProfileEntity profile = profileService.getCurrentProfile();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        excelService.writeIncomesToExcel(
                baos,
                incomeService.getCurrentMonthIncomesForCurrentUser()
        );

        emailService.sendEmailWithAttachment(
                profile.getEmail(),
                "Your Income Excel Report",
                "Please find attached your income report.",
                baos.toByteArray(),
                "income.xlsx"
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/expense-excel")
    public ResponseEntity<Void> emailExpenseExcel() throws IOException, MessagingException {

        ProfileEntity profile = profileService.getCurrentProfile();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        excelService.writeExpensesToExcel(
                baos,
                expenseService.getCurrentMonthExpensesForCurrentUser()
        );

        emailService.sendEmailWithAttachment(
                profile.getEmail(),
                "Your Expense Excel Report",
                "Please find attached your expense report.",
                baos.toByteArray(),
                "expenses.xlsx"
        );

        return ResponseEntity.ok(null);
    }
}