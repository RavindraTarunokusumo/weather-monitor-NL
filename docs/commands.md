# Commands Reference

## Setup

Backend once dependencies exist:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

For Windows PowerShell:

```powershell
.venv\Scripts\activate
pip install -r requirements.txt
```

Frontend once dependencies exist:

```bash
npm install
```

## Development Server

Backend placeholder:

```bash
uvicorn src.api.main:app --reload
```

Frontend placeholder:

```bash
npm run dev
```

Replace with actual project commands after the first implementation milestone.

## Testing

```bash
pytest
```

## Lint and Format

```bash
ruff check . --fix
ruff format .
```

Frontend:

```bash
npm run lint
npm test
```

## Database

Placeholder commands until migrations exist:

```bash
python scripts/init_db.py
python scripts/seed_mock_db.py
python scripts/reset_db.py
```

## Logs

```bash
tail -f logs/*.log
```

## Environment Variables

List required variables as they are introduced:

```bash
APP_ENV=development
DATABASE_URL=
KNMI_API_KEY=
OPENAI_API_KEY=
```

Never commit real secrets.

## Git Notes

Add a structured note for the latest commit:

```bash
git log -1 --format="%H"
git notes add -m "Task: <task name>
Summary: <brief what changed and why>
Spec: <docs/specs/<feature-slug>.md, or N/A>
Docs: <docs paths updated, comma-separated, or N/A>
TODO: <TODO.md section/item reference>
Validation: <checks run>" <commit_hash>
```
