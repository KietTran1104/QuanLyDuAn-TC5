package com.jira.clone.services;

/**
 * Service gửi email thông qua Brevo (Sendinblue) API.
 */
public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode);
}
