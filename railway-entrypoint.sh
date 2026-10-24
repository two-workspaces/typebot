#!/bin/bash
# Railway entrypoint for the Typebot builder. Without SMTP settings, sign-in
# emails go to a mail catcher on localhost that prints the code to these logs.
set -e

if [ -z "$SMTP_HOST" ]; then
  node /app/login-mail.cjs &
  export SMTP_HOST=127.0.0.1 SMTP_PORT=2525 SMTP_IGNORE_TLS=true
  export NEXT_PUBLIC_SMTP_FROM="${NEXT_PUBLIC_SMTP_FROM:-Typebot <typebot@localhost>}"
  unset SMTP_USERNAME SMTP_PASSWORD
  echo "No SMTP_HOST: sign-in codes are printed to these logs. Sign in with ${ADMIN_EMAIL:-your ADMIN_EMAIL}."
fi

exec ./builder-entrypoint.sh
