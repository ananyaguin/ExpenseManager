package in.ananyaguin.expensemanager1.controller;

import in.ananyaguin.expensemanager1.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardData() {

        Map<String, Object> dashboardData =
                dashboardService.getDashboardData();

        return ResponseEntity.ok(dashboardData);
    }
}
