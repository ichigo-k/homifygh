import "server-only"
import nodemailer from "nodemailer"

const from = process.env.EMAIL_FROM ?? process.env.GMAIL_USER ?? ""

// When Gmail isn't configured yet, fall back to logging to the server console
// so the flows are fully testable in dev without real credentials. The .env
// ships with placeholders, so treat those as "not configured" too.
const user = process.env.GMAIL_USER
const pass = process.env.GMAIL_APP_PASSWORD
const emailConfigured = Boolean(
  user &&
  pass &&
  user !== "youraddress@gmail.com" &&
  !/^x+(\s+x+)*$/i.test(pass.trim())
)

// Single shared Gmail SMTP transport (app password — not the account password).
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

async function deliver(opts: {
  to: string
  subject: string
  html: string
  logLine: string
}) {
  if (!emailConfigured) {
    console.log(`\n [email dev fallback] → ${opts.to}\n   ${opts.subject}\n   ${opts.logLine}\n`)
    return
  }

  try {
    await transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error"
    console.error(`[email error] Failed to send to ${opts.to}:`, message)
    throw new Error(`Failed to send email: ${message}`)
  }
}

function shell(title: string, body: string) {
  return `
  <div style="background:#f6f7f6;padding:32px 0;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #ececec;border-radius:20px;overflow:hidden">
      <div style="padding:28px 32px 0">
        <span style="font-size:20px;font-weight:800;letter-spacing:-0.02em">Homify <span style="color:#16a34a">GH</span></span>
      </div>
      <div style="padding:20px 32px 32px">
        <h1 style="font-size:20px;font-weight:800;margin:8px 0 12px">${title}</h1>
        ${body}
      </div>
      <div style="padding:18px 32px;background:#fafafa;border-top:1px solid #ececec;color:#888;font-size:12px">
        © ${new Date().getFullYear()} Homify GH · Accra, Ghana
      </div>
    </div>
  </div>`
}

export async function sendOtpEmail(to: string, otp: string) {
  await deliver({
    to,
    logLine: `OTP code: ${otp}`,
    subject: `${otp} is your Homify verification code`,
    html: shell(
      "Verify your email",
      `<p style="color:#555;line-height:1.6;margin:0 0 20px">
         Enter this code to verify your email address. It expires in 10 minutes.
       </p>
       <div style="font-size:34px;font-weight:800;letter-spacing:10px;text-align:center;
                   background:#f0fdf4;color:#16a34a;border-radius:14px;padding:18px 0">
         ${otp}
       </div>
       <p style="color:#999;font-size:13px;margin:20px 0 0">
         Didn't request this? You can safely ignore this email.
       </p>`
    ),
  })
}

export async function sendBookingRequestEmail(opts: {
  to: string
  providerName: string
  customerName: string
  category: string
  when: string
  address: string
  notes?: string | null
  offeredAmount?: number | null
  link: string
}) {
  await deliver({
    to: opts.to,
    logLine: `New booking from ${opts.customerName} · ${opts.category} · ${opts.when}`,
    subject: `New booking request from ${opts.customerName}`,
    html: shell(
      "You have a new booking request",
      `<p style="color:#555;line-height:1.6;margin:0 0 16px">
         Hi ${opts.providerName}, <strong>${opts.customerName}</strong> just requested a service on Homify.
       </p>
       <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;margin:0 0 20px">
         <tr><td style="padding:6px 0;color:#888">Service</td><td style="padding:6px 0;text-align:right;font-weight:600">${opts.category}</td></tr>
         <tr><td style="padding:6px 0;color:#888">When</td><td style="padding:6px 0;text-align:right;font-weight:600">${opts.when}</td></tr>
         <tr><td style="padding:6px 0;color:#888">Address</td><td style="padding:6px 0;text-align:right;font-weight:600">${opts.address}</td></tr>
         ${opts.offeredAmount ? `<tr><td style="padding:6px 0;color:#888">Customer's Flex offer</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#16a34a">GH₵${opts.offeredAmount.toLocaleString()}</td></tr>` : ""}
         ${opts.notes ? `<tr><td style="padding:6px 0;color:#888;vertical-align:top">Details</td><td style="padding:6px 0;text-align:right">${opts.notes}</td></tr>` : ""}
       </table>
       <a href="${opts.link}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;
                 font-weight:700;padding:13px 26px;border-radius:999px">
         Review request
       </a>
       <p style="color:#999;font-size:13px;margin:20px 0 0">
         Respond quickly to win the job — customers can pick another provider.
       </p>`
    ),
  })
}

export async function sendStoreSetupEmail(to: string, name: string, link: string) {
  await deliver({
    to,
    logLine: `Approved. Store setup: ${link}`,
    subject: "You're approved — set up your Homify store",
    html: shell(
      "You're approved! ",
      `<p style="color:#555;line-height:1.6;margin:0 0 20px">
         Hi ${name}, your provider application has been reviewed and approved.
         The last step is to set up your service store so customers can find and book you.
       </p>
       <a href="${link}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;
                 font-weight:700;padding:13px 26px;border-radius:999px">
         Set up my store
       </a>
       <p style="color:#999;font-size:13px;margin:20px 0 0">
         Or paste this link into your browser:<br>${link}
       </p>`
    ),
  })
}

export async function sendRejectionEmail(to: string, name: string, reason: string, link: string) {
  await deliver({
    to,
    logLine: `Rejected: ${reason} · Resubmit: ${link}`,
    subject: "Update on your Homify provider application",
    html: shell(
      "Your application needs attention",
      `<p style="color:#555;line-height:1.6;margin:0 0 16px">
         Hi ${name}, we couldn't approve your provider application as submitted.
       </p>
       <div style="background:#fef2f2;border-radius:12px;padding:14px 16px;color:#b91c1c;margin:0 0 20px">
         ${reason}
       </div>
       <a href="${link}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;
                 font-weight:700;padding:13px 26px;border-radius:999px">
         Resubmit application
       </a>`
    ),
  })
}
