// A mail catcher on localhost for Typebot's sign-in emails. Typebot only
// signs in with a 6-digit code sent by email (or OAuth), and Railway blocks
// outbound SMTP below Pro, so without this a fresh deploy has no way in.
// Each email lands here and its sign-in code is printed to the deploy logs.
const net = require("node:net");

const port = Number(process.env.LOGIN_MAIL_PORT || 2525);

const decode = (raw) =>
  raw
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&");

const report = (raw) => {
  const body = decode(raw);
  const to = /^To:\s*(.+)$/im.exec(raw)?.[1]?.trim() ?? "unknown";
  const subject = /^Subject:\s*(.+)$/im.exec(raw)?.[1]?.trim() ?? "";
  const link = /https?:\/\/[^\s"'<>]+\/signin\/email-redirect\?[^\s"'<>]+/.exec(body)?.[0];
  if (link) {
    const code = new URL(link).searchParams.get("token");
    console.log(`\n==== Typebot sign-in code for ${to}: ${code} ====\n     or open: ${link}\n`);
  } else {
    console.log(`[login-mail] "${subject}" to ${to} was not delivered: set SMTP_HOST to send email`);
  }
};

net
  .createServer((sock) => {
    let buf = "";
    let data = null;
    const say = (line) => sock.write(`${line}\r\n`);
    say("220 localhost Typebot login mail");
    sock.on("data", (chunk) => {
      buf += chunk.toString("latin1");
      for (;;) {
        if (data !== null) {
          const end = buf.indexOf("\r\n.\r\n");
          if (end < 0) return;
          data += buf.slice(0, end);
          buf = buf.slice(end + 5);
          try {
            report(data);
          } catch (err) {
            console.error("[login-mail]", err);
          }
          data = null;
          say("250 OK");
          continue;
        }
        const nl = buf.indexOf("\r\n");
        if (nl < 0) return;
        const cmd = buf.slice(0, nl).toUpperCase();
        buf = buf.slice(nl + 2);
        if (cmd.startsWith("EHLO")) say("250 localhost");
        else if (cmd.startsWith("DATA")) {
          data = "";
          say("354 End data with <CR><LF>.<CR><LF>");
        } else if (cmd.startsWith("QUIT")) {
          say("221 Bye");
          sock.end();
        } else say("250 OK");
      }
    });
    sock.on("error", () => {});
  })
  .listen(port, "127.0.0.1");
