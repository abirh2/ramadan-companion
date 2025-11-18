#!/bin/bash
# Test script to manually trigger prayer notifications
# Usage: ./test-notifications.sh

# Load CRON_SECRET from .env.local
CRON_SECRET=$(grep CRON_SECRET .env.local | cut -d '=' -f2)

echo "🧪 Testing push notification system..."
echo "📡 Triggering /api/push/schedule endpoint..."
echo ""

# For local testing
curl -X POST http://localhost:3000/api/push/schedule \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -v

echo ""
echo "✅ Test complete! Check your browser/phone for notifications."
echo ""
echo "📋 What this does:"
echo "   1. Fetches all users with notifications enabled"
echo "   2. Calculates their prayer times"
echo "   3. Sends push notifications for enabled prayers"
echo ""
echo "🔍 Check server logs for detailed results."

