# Codex Telegram Agent

Persistent Telegram controller for your local Codex CLI session.

## Features
- Persistent Codex session (`/new` resets session)
- Multi-session listing and selection
- Engine switch (`/engine win`, `/engine wsl`)
- Long prompt capture (`/starttask` then `/run`)
- Voice prompt transcription (Telegram voice -> Whisper -> Codex)
- Final output only (no streaming chunks)
- Access locked to one Telegram user ID

## Setup
1. Install Node.js on your machine.
2. In this folder:
   - `npm install`
3. Copy env file:
   - `cp .env.example .env`
4. Edit `.env`:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_ALLOWED_USER_ID`
   - `REPO_PATH_WINDOWS`
   - `REPO_PATH_WSL`

## Voice prerequisites
- Install `ffmpeg` and make sure it is in PATH.
- Install Whisper:
  - `pip install openai-whisper`

## Run
- `npm start`

The bot will start polling Telegram and control Codex from your local machine.

## Commands
- `/new` -> start a fresh persistent Codex session
- `/sessions` -> list sessions
- `/use <id>` -> select active session
- `/close <id>` -> stop and remove session
- `/engine win` -> use Windows Codex
- `/engine wsl` -> use WSL Codex
- `/starttask` -> begin buffering multi-line task
- `/run` -> send buffered task to Codex
- `/output` -> show output handling configuration

## Notes
- If Codex output is cut too early/late, tune:
  - `CODEX_OUTPUT_IDLE_MS`
  - `CODEX_OUTPUT_MAX_MS`
- If voice transcription fails, verify `ffmpeg` and `whisper` are installed and executable from terminal.
