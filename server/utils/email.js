const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.firstName = user.firstName;
    this.to = user.email;
    this.url = url;
    this.from = `Osarumwense Nicholas ${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_DEV_HOST,
      port: process.env.EMAIL_DEV_PORT,
      auth: {
        user: process.env.EMAIL_DEV_USERNAME,
        pass: process.env.EMAIL_DEV_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      subject,
      url: this.url,
      firstName: this.firstName,
    });

    const mailOpts = {
      text: htmlToText(html),
      from: this.from,
      to: this.to,
      subject,
      html,
    };

    await this.newTransport().sendMail(mailOpts);
  }

  async welcome() {
    await this.send("welcome", "Welcome To The Stream");
  }

  async ResetPassword() {
    await this.send(
      "resetPassword",
      "Your Password Reset Token (Only valid for 10mins)"
    );
  }
};
