#!/bin/bash

REQUIRED_ENV=(
    'FIREBASE_API_KEY:NEXT_PUBLIC_API_KEY'
    'FIREBASE_PROJECT_ID:NEXT_PUBLIC_PROJECT_ID'
    'FIREBASE_APP_ID:NEXT_PUBLIC_APP_ID'
    'FIREBASE_AUTH_DOMAIN:NEXT_PUBLIC_AUTH_DOMAIN'
    'FIREBASE_MESSAGING_SENDER_ID:NEXT_PUBLIC_MESSAGING_SENDER_ID'
    'FIREBASE_DATABASE_URL:NEXT_PUBLIC_DATABASE_URL'
    'FIREBASE_STORAGE_BUCKET:NEXT_PUBLIC_STORAGE_BUCKET'
    'FIREBASE_MEASUREMENT_ID:NEXT_PUBLIC_MEASUREMENT_ID'
    'FIREBASE_SERVICE_ACCOUNT:SERVICE_ACCOUNT'
)

for i in "${REQUIRED_ENV[@]}"
do
    IFS=':' read <<<"$i" in out

    if [[ -z ${!in} ]]; then
        >&2 echo "Missing required env: $in"
        exit 1
    else
        set -a
        printf -v "$out" '%s' "${!in}"
        set +a
    fi
done

npx next start "${@}"
