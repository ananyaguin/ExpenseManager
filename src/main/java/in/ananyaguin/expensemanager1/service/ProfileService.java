package in.ananyaguin.expensemanager1.service;

import in.ananyaguin.expensemanager1.dto.ProfileDto;
import in.ananyaguin.expensemanager1.entity.ProfileEntity;
import in.ananyaguin.expensemanager1.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileDto registerProfile(ProfileDto profileDto){

        ProfileEntity newProfile = toEntity(profileDto);
        newProfile.setActivationToken(
                UUID.randomUUID().toString()
        );
        newProfile = profileRepository.save(newProfile);
        return toDto(newProfile);

    }

    public ProfileEntity toEntity(ProfileDto profileDto){

        return ProfileEntity.builder()
                .id(profileDto.getId())
                .fullName(profileDto.getFullName())
                .email(profileDto.getEmail())
                .password(profileDto.getPassword())
                .profileImageUrl(profileDto.getProfileImageUrl())
                .createdAt(profileDto.getCreatedAt())
                .updatedAt(profileDto.getUpdatedAt())
                .build();
    }

    public ProfileDto toDto(ProfileEntity profileEntity){
        return ProfileDto.builder()
                .id(profileEntity.getId())
                .fullName(profileEntity.getFullName())
                .email(profileEntity.getEmail())
                .password(profileEntity.getPassword())
                .profileImageUrl(profileEntity.getProfileImageUrl())
                .createdAt(profileEntity.getCreatedAt())
                .updatedAt(profileEntity.getUpdatedAt())
                .build();
    }



}