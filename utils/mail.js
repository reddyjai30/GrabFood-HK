const nodemailer = require('nodemailer');



const sendMail = async (to, password, ownerName, restaurantName, appLink, yourName, companyName, contactInfo, email) => {
  const subject = 'Access to Admin Portal for Restaurant Data Management';
  const htmlContent = `
<html>
<body>
  <p>Dear <strong>${ownerName}</strong>,</p>
  <p>We are pleased to inform you that your restaurant, <strong>${restaurantName}</strong>, has been set up on our admin portal for data management. You can now access the portal to view and manage your restaurant's information.</p>
  <p>Here are your login credentials:</p>
  <p>
    <strong>App Link:</strong> <a href="${appLink}">${appLink}</a><br>
    <strong>Email:</strong> ${email}<br>
    <strong>Password:</strong> ${password}
  </p>
  <p>Directions to Login:</p>
  <ol>
    <li>Click on the provided portal link to access the login page.</li>
    <li>Enter your registered email address and the assigned password.</li>
    <li>Once logged in, you will have get a registration form where you can add all details.</li>
    <li>After filling up the form, wait for admin approval.</li>
  </ol>
  <p>Additionally, we kindly request you to complete a registration form to provide detailed information about your restaurant. You can find the registration form by logging into the admin portal. The form will help us ensure that your restaurant's information is accurate and up-to-date.</p>
  <p>If you encounter any issues or have questions regarding the login process or registration form, please don't hesitate to reach out to us at <strong>${contactInfo}</strong>.</p>
  <p>We look forward to collaborating with you to enhance your restaurant's presence on our platform.</p>
  <p>Thank you for partnering with us!</p>
  <p>Best regards,</p>
  <p><strong>${yourName}</strong><br>
  <strong>${companyName}</strong><br>
  ${contactInfo}</p>
</body>
</html>
`;

  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE , // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: `"${yourName}" <${process.env.MAIL_FROM}>`, // Sender name and email address
      to: to, // Recipient email address
      subject: subject,
      html: htmlContent, // Email content in HTML format
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { success: false, error: error };
  }
};

module.exports = { sendMail };
