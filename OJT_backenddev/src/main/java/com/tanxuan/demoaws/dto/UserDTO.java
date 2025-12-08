package com.tanxuan.demoaws.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;

public class UserDTO {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserUpdateRequest {
        @NotBlank(message = "Họ và tên không được để trống")
        @Size(min = 3, max = 255, message = "Họ và tên phải từ 3 đến 255 ký tự")
        private String fullName;

        @Pattern(regexp = "^$|^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 hoặc +84 và có 10 số")
        private String phoneNumber;

        @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
        @Pattern(regexp = "^[\\p{L}0-9\\s,./\\-_]*$", message = "Địa chỉ chỉ được chứa chữ cái, số và các ký tự đặc biệt thông dụng")
        private String address;

        @Pattern(regexp = "^\\d{2}/\\d{2}/\\d{4}$", message = "Ngày sinh phải có định dạng dd/MM/yyyy")
        private String dateOfBirth;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private UUID id;

        @Email(message = "Email không hợp lệ")
        private String email;

        private String fullName;
        private String phoneNumber;
        private String address;
        private LocalDate dateOfBirth;
        private String role;
        private boolean active;

        // Thêm các phương thức helper
        public Integer getAge() {
            if (dateOfBirth == null) return null;
            return Period.between(dateOfBirth, LocalDate.now()).getYears();
        }
                

        public boolean isPhoneNumberVerified() {
            return phoneNumber != null && !phoneNumber.isEmpty();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank(message = "Mật khẩu hiện tại không được để trống")
        private String currentPassword;

        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Size(min = 8, max = 50, message = "Mật khẩu phải từ 8 đến 50 ký tự")
        @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Mật khẩu mới phải có chữ hoa, chữ thường, chữ số và ký tự đặc biệt"
        )
        private String newPassword;

        @NotBlank(message = "Xác nhận mật khẩu không được để trống")
        private String confirmPassword;

        public boolean isPasswordsMatch() {
            return newPassword != null && newPassword.equals(confirmPassword);
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUserRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;

        @NotBlank(message = "Họ và tên không được để trống")
        @Size(min = 3, max = 255, message = "Họ và tên phải từ 3 đến 255 ký tự")
        @Pattern(regexp = "^[\\p{L}\\s'-]+$",
                message = "Họ và tên chỉ được chứa chữ cái, dấu cách và dấu nối")
        private String fullName; 

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 8, max = 50, message = "Mật khẩu phải từ 8 đến 50 ký tự")
        @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Mật khẩu phải có chữ hoa, chữ thường, chữ số và ký tự đặc biệt"
        )
        private String password;

        @Pattern(regexp = "^$|^(0|\\+84)[0-9]{9}$",
                message = "Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 hoặc +84 và có 10 số")
        private String phoneNumber; 

        @NotNull
        private String role;

        @NotNull(message = "Ngày sinh không được để trống")
        @Pattern(regexp = "^\\d{2}/\\d{2}/\\d{4}$", message = "Ngày sinh phải có định dạng dd/MM/yyyy")
        private String dateOfBirth;

        private String address;

        private Boolean isActive = true;

        public boolean isValidAge() {
            if (dateOfBirth == null || dateOfBirth.trim().isEmpty()) return false;
            try {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
                LocalDate birthDate = LocalDate.parse(dateOfBirth, formatter);
                int age = Period.between(birthDate, LocalDate.now()).getYears();
                return age >= 18 && age <= 100;
            } catch (Exception e) {
                return false;
            }
        }
    }
}
