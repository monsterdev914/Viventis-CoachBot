# Email Setup Instructions

## Contact Form Email Integration

The contact form now uses **Web3Forms**, a free email service that allows you to receive form submissions directly to your email without needing a backend server.

### Setup Steps:

1. **Get your Web3Forms Access Key:**
   - Go to https://web3forms.com/
   - Sign up for a free account
   - Create a new form and get your access key
   - The free plan allows 1000 submissions per month

2. **Configure Environment Variables:**
   - Create a `.env.local` file in the `front-end` directory
   - Add your Web3Forms access key:
   ```
   NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your_access_key_here
   ```

3. **Alternative Free Services:**
   If you prefer other services, you can easily switch:

   **Option A: Formspree**
   - Go to https://formspree.io/
   - Create a form and get your form ID
   - Replace the fetch URL with: `https://formspree.io/f/YOUR_FORM_ID`

   **Option B: Netlify Forms**
   - If hosting on Netlify, you can use their built-in form handling
   - Add `netlify` attribute to the form element

   **Option C: EmailJS**
   - Go to https://www.emailjs.com/
   - Set up email templates and service
   - Install: `npm install @emailjs/browser`

### Current Configuration:

- **Service**: Web3Forms
- **Target Email**: info@der-innere-kompass.com
- **Subject**: "Neue Kontaktanfrage von der-innere-kompass.com"
- **Fields**: Name, Email, Phone, Message
- **Validation**: Required fields and privacy policy agreement
- **Features**: Loading states, success/error messages, form reset

### Testing:

1. Make sure your environment variable is set
2. Fill out the contact form on the website
3. Check the configured email address for the submission
4. Verify all form fields are included in the email

### Troubleshooting:

- If emails aren't being received, check your spam folder
- Verify the access key is correctly set in the environment file
- Check the browser console for any error messages
- Make sure the target email address is correct

### Security Notes:

- The access key is prefixed with `NEXT_PUBLIC_` because it needs to be accessible in the browser
- Web3Forms has built-in spam protection
- All form submissions are logged in your Web3Forms dashboard
- Consider adding additional validation or captcha for production use 