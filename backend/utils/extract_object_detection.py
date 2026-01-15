from utils.pdf_extractor import extract_pages
from utils.ocr_extractor import ocr_pages
from utils.extract_syllabus import extract_clean_syllabus
BASE = "subjects/ObjectDetection"

# We will only extract:
# - 1 page: overall syllabus from course_handout
# - 5 pages: detailed lecture plan from course_handout
# - First 5 pages of each lecture PDF (enough for now)

extract_pages(f"{BASE}/source/course_handout_OD.pdf", [0], f"{BASE}/extracted/syllabus.txt")

# Clean the syllabus and overwrite the file
syllabus_file = f"{BASE}/extracted/syllabus.txt"
cleaned_syllabus = extract_clean_syllabus(syllabus_file)
with open(syllabus_file, 'w', encoding='utf-8') as f:
    f.write(cleaned_syllabus)

extract_pages(f"{BASE}/source/HoG.pdf", [1,2,3,4,5], f"{BASE}/extracted/HoG.txt")
extract_pages(f"{BASE}/source/SIFT.pdf", [1,2,3,4,5], f"{BASE}/extracted/SIFT.txt")