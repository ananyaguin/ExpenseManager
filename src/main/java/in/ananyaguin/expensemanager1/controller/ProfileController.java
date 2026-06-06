package in.ananyaguin.expensemanager1.controller;

import in.ananyaguin.expensemanager1.dto.ProfileDto;
import in.ananyaguin.expensemanager1.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping("/register")
    public ResponseEntity<ProfileDto> registerProfile(
            @RequestBody ProfileDto profileDto
    )
    {
        ProfileDto registeredProfile =
                profileService.registerProfile(profileDto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(registeredProfile);
    }
    @GetMapping("/activate")
    public ResponseEntity<String> activateProfile(
            @RequestParam("token") String activationToken) {

        boolean isActivated =
                profileService.activateProfile(activationToken);

        if (isActivated) {
            return ResponseEntity.ok("Profile activated successfully");
        }

        return ResponseEntity.badRequest()
                .body("Invalid activation token");
    }
    }
    
