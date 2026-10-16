const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const resend = require('../utils/resendClient');

// POST Route: Save to DB
router.post('/', async (req, res) => {
  const { fullName, companyName, email, phone, businessType, subject, message, emailSubject } = req.body;

  // Validation
  if (!fullName || !email || !phone || !businessType || !subject || !message) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  try {
    /* POSTGRES LOGIC COMMENTED OUT
    const insertQuery = `
      INSERT INTO contacts (full_name, company_name, email, phone, business_type, subject, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const dbValues = [fullName, companyName || null, email, phone, businessType, subject, message];
    
    const newContact = await pool.query(insertQuery, dbValues);
    console.log("✅ Saved to DB:", newContact.rows[0]);
    */

    // MongoDB Logic
    const newContact = await Contact.create({
      fullName,
      companyName,
      email,
      phone,
      businessType,
      subject,
      message
    });
    console.log("✅ Saved to DB:", newContact);

    // Send email notification
    try {
      await resend.emails.send({
        from: 'AK Solutions Notifications <onboarding@resend.dev>',
        to: 'customer.support@techhansha.com',
        subject: emailSubject || 'Notification from Contact Form',
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Business Type:</strong> ${businessType}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      });
      console.log("✅ Email sent successfully");
    } catch (emailError) {
      console.error("❌ Failed to send email:", emailError);
      // Decide if you want to return error or still return 200 since DB saved. Let's return 200 but log error.
    }

    res.status(200).json({ message: 'Message saved successfully!' });

  } catch (error) {
    console.error('❌ Error in contact route:', error.message);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

module.exports = router;