import nodemailer from "nodemailer";

// NOTE: this authorize URL was supplied directly by the client and includes
// OAuth/OIDC session parameters (nonce, state, code_challenge) that MortgageMax
// generates per visit to their "Apply" page - these are typically short-lived.
// If users start reporting a broken/expired link, ask the partner (Mortgage
// Factory / consultant Braiden Elijah) for a stable, bookmarkable landing page
// URL instead of an authorize-endpoint link.
export const HOME_LOAN_APPLY_URL =
  "https://mortgagemaxprod.b2clogin.com/mortgagemaxprod.onmicrosoft.com/b2c_1a_mmonline___prod/oauth2/v2.0/authorize?client_id=17bb4771-dd51-47f8-8ca8-dab607505fb4&redirect_uri=https%3A%2F%2Fonline.mortgagemax.co.za%2Fsignin-oidc&response_type=code&scope=openid%20profile%20offline_access&code_challenge=VYorc61LjEUv34X_mIZM42Q60orHkz02mfdF_YRVMVQ&code_challenge_method=S256&response_mode=form_post&nonce=639218609028179432.OWM0NGQzODAtZjgzNi00Njc5LWJkYzgtYzFhMjY3YTQyMzFjMmExNDJlNzUtYTA4Ni00YjhiLTg2ZjMtN2Q4Nzg1MGYwZjM2&client_info=1&x-client-brkrver=IDWeb.3.0.1.0&aggregatorSlug=mortgage-factory&consultantSlug=mfactory-braiden-elijah&state=CfDJ8GJDSYhOTrpBnl3ZgUXFltiG5Vuk_lPHWrHqVbR6YzPOtz87QLKDMjvpiFV9fhilG_za9jS87NY1Z9SRJ1H_stHPJstmAZ6c_n_2NZCUwdiDQIkZnPyt_wILmvSjtpcHq064zd-SEAYgybA6MI_8gySlGzzj76QPtYB2xdwMR-chqMs_fssxH8UAqqgEpCXgBzyN7xMXZ4ocYyWOfJ1rgdha13EtJKzrcLgAAoSinHaD8pSzvVf0Xbz-wnXuaiWKnuLpKTUsC68PpCZj1rMZBzHBgd8uZ6gwDr9tLDOFj-HTaPG64CNpHpkoN_-Yb-ESpKgXf6sSGxeA2gE_3cIRWpypUGXOKjZAKn4pNK4jWMosQQRp7Zqm8K35kMDr4G5NfmqfX4x_jvqza6LsTgZdQBrzhq3p6Rd7t-uYRwbMd793&x-client-SKU=ID_NET8_0&x-client-ver=8.0.1.0";

const NOTIFY_RECIPIENTS = ["Peter@spurgeonproperty.com", "Malcolmgov24@gmail.com"];

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_PASS;
  if (!gmailUser || !gmailPassword) return null;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPassword.replace(/\s/g, "") },
  });
  return transporter;
}

// Fire-and-forget notification to Peter and the site manager whenever the
// chatbot's home loan / bond FAQ answers a question - no name/email is
// collected at this point (it's a deterministic FAQ match, not a lead form),
// so this is a heads-up, not a contactable lead record.
export async function notifyHomeLoanInquiry(userMessage: string, sessionId: string): Promise<void> {
  const mail = getTransporter();
  if (!mail) {
    console.log("notifyHomeLoanInquiry: no email transporter configured, skipping");
    return;
  }

  const timestamp = new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" });

  try {
    await mail.sendMail({
      from: process.env.GMAIL_USER,
      to: NOTIFY_RECIPIENTS.join(", "),
      subject: "🏦 Home Loan / Bond Interest - Spurgeon Property Chatbot",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color:#7c3aed;">Home Loan / Bond Interest</h2>
          <p>Someone asked the website chatbot about a home loan or bond, and was pointed to the MortgageMax application link.</p>
          <p><strong>Their message:</strong></p>
          <p style="background:#f4f4f5; padding:12px; border-radius:8px;">${escapeHtml(userMessage)}</p>
          <p><strong>Chat session:</strong> ${escapeHtml(sessionId)}</p>
          <p><strong>Time:</strong> ${timestamp}</p>
        </div>
      `,
    });
    console.log("notifyHomeLoanInquiry: sent to", NOTIFY_RECIPIENTS.join(", "));
  } catch (error) {
    console.error("notifyHomeLoanInquiry: failed to send email", error);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
