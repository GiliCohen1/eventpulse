#!/bin/bash
set -e

echo "Waiting for Kafka to be ready..."
sleep 5

BROKER="kafka:29092"

TOPICS=(
  "user.registered"
  "user.updated"
  "event.created"
  "event.updated"
  "event.published"
  "event.cancelled"
  "event.live"
  "event.ended"
  "ticket.reserved"
  "ticket.confirmed"
  "ticket.cancelled"
  "ticket.checked_in"
  "payment.completed"
  "chat.message_sent"
  "notification.send"
  "analytics.track"
)

for TOPIC in "${TOPICS[@]}"; do
  echo "Creating topic: $TOPIC"
  kafka-topics --create \
    --bootstrap-server "$BROKER" \
    --replication-factor 1 \
    --partitions 3 \
    --topic "$TOPIC" \
    --if-not-exists
done

echo "✓ All Kafka topics created successfully"
kafka-topics --list --bootstrap-server "$BROKER"
