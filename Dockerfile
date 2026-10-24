FROM baptistearno/typebot-builder:3.19.1
COPY --chmod=755 railway-entrypoint.sh /app/railway-entrypoint.sh
COPY login-mail.cjs /app/login-mail.cjs
ENTRYPOINT ["/app/railway-entrypoint.sh"]
