#!/bin/bash

echo "Attempting to find and kill processes on port 5000..."

# Try to find PID using netstat
echo "Checking with netstat..."
pids=$(netstat -nlp 2>/dev/null | grep ":5000" | awk '{print $7}' | awk -F'/' '{print $1}')

if [ -n "$pids" ]; then
  echo "Found processes: $pids"
  for pid in $pids; do
    if [ -n "$pid" ] && [ "$pid" != "" ]; then
      echo "Killing process $pid"
      kill -9 $pid
    fi
  done
  echo "Attempted to kill processes using netstat"
else
  echo "No processes found using netstat"
fi

# Try another approach with ss
echo "Checking with ss..."
pids=$(ss -lptn 'sport = :5000' 2>/dev/null | grep -oP '(?<=pid=).*?(?=,|$)' | sort -u)

if [ -n "$pids" ]; then
  echo "Found processes: $pids"
  for pid in $pids; do
    if [ -n "$pid" ] && [ "$pid" != "" ]; then
      echo "Killing process $pid"
      kill -9 $pid
    fi
  done
  echo "Attempted to kill processes using ss"
else
  echo "No processes found using ss"
fi

# Final fallback to kill all node processes
echo "Last resort: killing all node/tsx processes..."
pkill -f "node.*server" || echo "No node server processes found"
pkill -f "tsx.*server" || echo "No tsx server processes found"
pkill -f "node.*index.ts" || echo "No node index.ts processes found"
pkill -f "tsx.*index.ts" || echo "No tsx index.ts processes found"

echo "Done attempting to kill processes. Waiting 2 seconds..."
sleep 2
echo "You can now try restarting your workflow."