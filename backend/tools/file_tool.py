import os

DATA_PATH = "data/notes.txt"

def write_file(text):
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        f.write(text + "\n")

    return "Saved to notes.txt"

def read_file():
    if not os.path.exists(DATA_PATH):
        return "File not found."
    
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return f.read()
