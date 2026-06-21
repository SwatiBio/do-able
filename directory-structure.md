# Do-able — Directory Structure

```
todo-todo/
├── doable.html              # The entire app — HTML + CSS + JS
├── backup-backend/          # Archived FastAPI backend (for reference)
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── services/
│   │   └── routes/
│   ├── tests/
│   ├── pyproject.toml
│   └── requirements.txt
├── backup-frontend/         # Archived React frontend (for reference)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.ts
├── start.bat                # Opens doable.html on Windows
├── start.sh                 # Opens doable.html on Linux/macOS
├── design.md                # Design specification
├── api.md                   # localStorage data API reference
├── directory-structure.md   # This file
├── TRACKER.md               # Build tracker
└── todo-prompt.txt          # Original build prompt
```
