// external modules
const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars');
const config = require("config");

const mail = config.get("mail");
if (!mail) throw new Error("Mail in config not defined.");

let transporter = nodemailer.createTransport({
  ...mail.server,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});
transporter.use('compile', hbs({
  viewEngine: {
    layoutsDir: 'src/templates'
  },
  viewPath: 'src/templates',
}));

async function sendMail (options, ...rest) {
    options = {        
    from: { ...mail.sender },
        ...options
    }
    await transporter.sendMail(options, ...rest);
}

module.exports = { transporter, sendMail };