#!/bin/bash
set -euo pipefail

echo "Entry point script running"

CONFIG_FILE=_config.yml

# Function to manage Gemfile.lock
manage_gemfile_lock() {
    echo "Managing Gemfile.lock"
    git config --global --add safe.directory '*'
    if command -v git &> /dev/null && [ -f Gemfile.lock ]; then
        if git ls-files --error-unmatch Gemfile.lock &> /dev/null; then
            echo "Gemfile.lock is tracked by git, keeping it intact"
            git restore Gemfile.lock 2>/dev/null || true
        else
            echo "Gemfile.lock is not tracked by git, removing it"
            rm Gemfile.lock
        fi
    fi
}

start_jekyll() {
    echo "Starting Jekyll"
    manage_gemfile_lock
    bundle exec jekyll serve --watch --port=8080 --host=0.0.0.0 --livereload --verbose --trace --force_polling --baseurl="" &
    jekyll_pid=$!
    echo "Jekyll started with PID $jekyll_pid"
}

start_jekyll

while true; do
    echo "Waiting for changes to $CONFIG_FILE"
    inotifywait -q -e modify,move,create,delete $CONFIG_FILE
    if [ $? -eq 0 ]; then
        echo "Change detected to $CONFIG_FILE, restarting Jekyll"
        jekyll_pid=$(pgrep -f jekyll)
        echo "Killing Jekyll process with PID $jekyll_pid"
        kill -KILL $jekyll_pid
        start_jekyll
    fi
done
