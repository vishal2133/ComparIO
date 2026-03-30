const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPriceDropAlert = async ({ email, productName, platform, oldPrice, newPrice, buyUrl }) => {
  const savings = oldPrice - newPrice;
  const savingsPct = Math.round((savings / oldPrice) * 100);

  const mailOptions = {
    from: `ComparIO Alerts <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🔥 Price Drop Alert: ${productName} is now ₹${newPrice.toLocaleString('en-IN')}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">💰 Price Drop Alert!</h1>
          <p style="margin: 8px 0 0; opacity: 0.85;">ComparIO found a better deal for you</p>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111; margin-top: 0;">${productName}</h2>
          <p style="color: #6b7280;">on <strong style="text-transform: capitalize">${platform}</strong></p>

          <div style="display: flex; gap: 16px; margin: 20px 0;">
            <div style="background: #fee2e2; padding: 12px 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #991b1b;">Was</div>
              <div style="font-size: 22px; font-weight: bold; color: #991b1b; text-decoration: line-through;">
                ₹${oldPrice.toLocaleString('en-IN')}
              </div>
            </div>
            <div style="background: #dcfce7; padding: 12px 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #166534;">Now</div>
              <div style="font-size: 22px; font-weight: bold; color: #166534;">
                ₹${newPrice.toLocaleString('en-IN')}
              </div>
            </div>
            <div style="background: #dbeafe; padding: 12px 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #1e40af;">You Save</div>
              <div style="font-size: 22px; font-weight: bold; color: #1e40af;">
                ${savingsPct}%
              </div>
            </div>
          </div>

          <a href="${buyUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Buy Now →
          </a>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            You're receiving this because you set a price alert on ComparIO.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Alert sent to ${email} for ${productName}`);
};

module.exports = { sendPriceDropAlert };