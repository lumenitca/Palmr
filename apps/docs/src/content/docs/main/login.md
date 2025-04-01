---
title: First Login (Admin)
---

Once you have started all the services as described in the deployment instructions, you will be able to access the frontend at:  

- **Production environment:** `{your_web_domain}`  
- **Local environment:** [http://localhost:4173](http://localhost:4173)  

Upon accessing the frontend, you will see a screen similar to the image below:  

![Palmr Landing Page](/public/general/lp.png)  

This is the **Palmr. landing page**, which provides basic information about the application. This landing page can be hidden later when you configure your app, allowing the login page to become the default home page. However, on the first execution, it is displayed by default.  

---

## First Login  

At the top of the landing page, you will see a button to log in to Palmr.:  

> **But you may wonder:** 

To simplify the process, Palmr. comes pre-configured with **seed data** upon the first initialization. This seed data includes a default **admin user** with full access to all settings and user management within the application.  

After clicking the **Login** button, you will be redirected to the login screen, which looks like this:  

![Palmr Login Page](/public/ui/login.png)  

Use the following default credentials to log in for the first time:  

| User       | Password   |
|------------|------------|
| `admin@example.com` | `admin123` |  

If everything is set up correctly, you will be authenticated and redirected to Palmr.'s main dashboard, which looks like this:  

![Palmr Dashboard](/public/ui/dashboard.png)  

At this point, you are officially logged in and ready to start using all the features of Palmr.!  

---

## Recommendations After First Access  

Since Palmr. includes a single default admin user in the seed data, it is **highly recommended** to change the default admin credentials immediately after the first login. This is crucial for maintaining the security of your instance.  

Follow these steps to update the admin credentials and secure your Palmr. instance:  

### Step 1: Access the Profile Settings  
1. Click the **user icon** located in the top right corner of the screen.  
2. A dropdown menu will appear with several options:  

![Palmr Profile Menu](/public/ui/menu.png)  

3. Select **"Profile"** from the dropdown menu. This will redirect you to the profile settings page:  

![Palmr Profile Page](/public/ui/profile.png)  

---

### Step 2: Update the Admin Profile  
On the profile settings page, you can update all the information related to the admin account.  

- To update the password, enter a new secure password and confirm it.  
- Update other details as needed based on your preferences.  

**Tip:** For better security, use a strong password containing:  
- At least 12 characters  
- A mix of uppercase and lowercase letters  
- Numbers and special characters  

---

### Step 3: Update the Profile Picture  
You can also update the profile picture for better personalization.  

1. Click the **camera icon** next to the avatar.  
2. Select an image from your local device.  

![Palmr Profile Picture](/public/ui/profile_picture.png)  

> **Recommendation:** Use a square image to ensure proper display.  

---

## Troubleshooting  

If you encounter any issues during the first login or profile update, please check the following:  
- Ensure that all services (frontend, backend, MinIO, and database) are running correctly.  
- Make sure the environment variables are properly configured.  
- Confirm that the database seeds have been applied correctly.  

---

## Security Best Practices  

- After setting up your admin account, create separate user accounts with limited access based on roles.  
- Use HTTPS to secure the connection between the client and the server.  
- Regularly update the Palmr. instance to benefit from the latest security patches and improvements.  

---


