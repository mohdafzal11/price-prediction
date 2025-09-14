#!/bin/sh
set -e

# Set up Python environment
export VIRTUAL_ENV=/venv
export PATH=$PATH:$VIRTUAL_ENV/bin

# Run setup script first to configure cron jobs
/app/start.sh

# Then start the main application
# Using exec to replace the current process with Node.js
# This ensures Docker/Coolify can properly manage the container