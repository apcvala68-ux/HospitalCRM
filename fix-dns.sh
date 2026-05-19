#!/bin/bash
# DNS Fix Script for Railway Backend Access
# This script fixes DNS resolution issues with Railway domains

echo "🔧 Fixing DNS for Railway backend access..."

# Backup current resolv.conf
sudo cp /etc/resolv.conf /etc/resolv.conf.backup 2>/dev/null

# Add Google DNS as primary
sudo sh -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
sudo sh -c 'echo "nameserver 1.1.1.1" >> /etc/resolv.conf'

echo "✅ DNS configured with Google (8.8.8.8) and Cloudflare (1.1.1.1)"

# Test Railway connectivity
echo "🧪 Testing Railway backend..."
if curl -s --max-time 5 https://hospitalcrm-production.up.railway.app/api/health > /dev/null 2>&1; then
    echo "✅ Railway backend is accessible!"
else
    echo "⚠️ Railway backend still not accessible. Try:"
    echo "   1. Restart your browser"
    echo "   2. Clear DNS cache: sudo systemd-resolve --flush-caches"
    echo "   3. Check if Railway project is running"
fi

echo ""
echo " To restore original DNS, run:"
echo "   sudo cp /etc/resolv.conf.backup /etc/resolv.conf"
