package in.ananyaguin.expensemanager1.controller;

import in.ananyaguin.expensemanager1.dto.ProfileDto;
import in.ananyaguin.expensemanager1.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ProfileController {

  private final ProfileService profileService;
  @PostMapping("/Register")
  public ResponseEntity<ProfileDto> registerProfile(@RequestBody ProfileDto profileDto){
      ProfileDto registerProfile =profileService.registerProfile( profileDto);
      return ResponseEntity.status(HttpStatus.CREATED).body(registerProfile);
  }
}
