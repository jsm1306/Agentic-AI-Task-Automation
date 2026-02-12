"""Repair script: merge notes files back into corresponding session JSON artifacts.notes

Usage: python scripts/repair_notes.py
"""
import json
from pathlib import Path
from datetime import datetime

base = Path(__file__).resolve().parents[1] / 'data'
notes_dir = base / 'notes'
sessions_dir = base / 'sessions'
backup_dir = base / 'backups'
backup_dir.mkdir(exist_ok=True)

repaired = 0
for notes_file in notes_dir.glob('*_notes.json'):
    session_id = notes_file.name.replace('_notes.json', '')
    session_file = sessions_dir / f'{session_id}.json'
    if not session_file.exists():
        print(f"Session file for {session_id} not found; skipping")
        continue

    notes = json.loads(notes_file.read_text(encoding='utf-8'))
    session_data = json.loads(session_file.read_text(encoding='utf-8'))
    artifacts = session_data.get('artifacts', {})
    existing_notes = artifacts.get('notes', [])

    # Determine which notes are missing by id
    existing_ids = {n['id'] for n in existing_notes}
    to_add = [n for n in notes if n.get('id') not in existing_ids]

    if to_add:
        # Backup session file
        bak = backup_dir / f"{session_id}_sessionbak_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        bak.write_text(session_file.read_text(encoding='utf-8'), encoding='utf-8')

        artifacts.setdefault('notes', []).extend(to_add)
        session_data['artifacts'] = artifacts
        session_file.write_text(json.dumps(session_data, indent=2, ensure_ascii=False), encoding='utf-8')
        repaired += len(to_add)
        print(f"Added {len(to_add)} notes to session {session_id}")
    else:
        print(f"No missing notes for session {session_id}")

print(f"Repair complete, total notes added: {repaired}")