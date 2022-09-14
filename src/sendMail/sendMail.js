const nodemailer = require("nodemailer");
const { config } = require("../config/config");

module.exports.sendEmail = (options, res) => {
  const transporter = nodemailer.createTransport({
    service: config.email_service,
    auth: {
      user: config.email_from,
      pass: config.email_password,
    },
    tls: {
      rejectUnauthorized: config.email_authorization,
    },
  });

  const mailOptions = {
    from: config.email_from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.status(422).json({
        message: "something is wrong, please try again",
        status: "error",
      });
    } else {
      return res.status(200).json({
        message: "Please check your mail, sometime you will find mail as spam.",
        status: "success",
      });
    }
  });
};
