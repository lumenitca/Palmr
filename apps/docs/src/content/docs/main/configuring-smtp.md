---
title: Configuring SMTP
---

For Palmr to function with all its best features, we need to configure our email server. To make this easier, there is a built-in configuration panel inside **Settings** in Palmr. However, only users with an **ADMIN** profile can access and configure these settings.

## Why Configure SMTP?

The main functionalities that depend on SMTP configuration are:
- **Password Reset** – Users who forget their password and cannot access the **Settings** panel need this feature.
- **Email Notifications** – Recipients will receive emails when new shares are sent to them.

Now, let's go through the step-by-step process to configure the **SMTP Server**.

---

## Accessing SMTP Settings

To access **Settings**, an **ADMIN** user must click on the profile picture in the **header** and select **Settings** from the dropdown menu.

<!-- ![Dropdown Menu](/public/main/smtp/dropdown-menu.png) -->

Once inside the **Settings** panel, click on the **Email** card to expand the SMTP configuration options.

<!-- ![Closed Settings Card](/public/main/settings/closed-card.png) -->

After expanding the card, the following SMTP configuration fields will appear:

<!-- ![Opened Settings Card](/public/main/settings/opened-card.png) -->

---

## Configuring SMTP Server

The first step is to **enable SMTP** by selecting "Yes" in the **SMTP Enabled** field.

<!-- ![SMTP Enabled](/public/main/settings/smtp-enabled.png) -->

Once SMTP is enabled, you can configure the other necessary fields:

- **Sender Name** – This will appear as the sender’s name in emails. (Example: "Palmr")
- **Sender Email** – The email address from which notifications will be sent. (Example: "noreply@palmr.app")
- **SMTP Server** – The SMTP server address. You can use any email service provider. For Gmail, use `smtp.gmail.com` (this is the recommended option and set as default).
- **SMTP Port** – The server port. For Gmail, the standard port is **587**.
- **SMTP Username** – The username for the SMTP server. For Gmail, enter your email address.
- **SMTP Password** – The SMTP password. 

> **Important:** If using **Gmail**, you need to generate an **App Password** instead of using your standard email password.
> For other email services, consult the official documentation of the service provider you are using. We recommend using Gmail for simplicity and limits the number of emails sent.

---

## Generating a Gmail App Password

To generate an App Password for Gmail:
1. Go to [Google My Account](https://myaccount.google.com/).
2. Select **Security**.
3. Scroll down to **App Passwords**.
4. Generate a new password specifically for Palmr.

For a complete guide, refer to: **[How to set up SMTP credentials with Gmail](https://medium.com/rails-to-rescue/how-to-set-up-smtp-credentials-with-gmail-for-your-app-send-email-cf236d11087d)**.

---

## Finalizing SMTP Configuration

After entering the correct information, save the settings. Palmr is now ready to send emails for password resets and share notifications!
