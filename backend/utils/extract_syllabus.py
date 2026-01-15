import re

def extract_clean_syllabus(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the syllabus section
    syllabus_match = re.search(r'Syllabus\s*:\s*(.*?)(?=Text Books\s*:|$)', content, re.DOTALL | re.IGNORECASE)
    if syllabus_match:
        syllabus_text = syllabus_match.group(1).strip()
        # Clean up extra spaces and newlines
        syllabus_text = re.sub(r'\s+', ' ', syllabus_text)
        # Split into COs for better readability
        cos = re.split(r'(CO\d+:|COS\d+:)', syllabus_text)
        cleaned_syllabus = []
        for i in range(1, len(cos), 2):
            co_title = cos[i].strip()
            co_content = cos[i+1].strip() if i+1 < len(cos) else ""
            cleaned_syllabus.append(f"{co_title} {co_content}")
        return '\n'.join(cleaned_syllabus)
    else:
        return "Syllabus section not found."

if __name__ == "__main__":
    # Usage
    file_path = r"s:\Automated_Agent\subjects\ObjectDetection\extracted\syllabus.txt"
    cleaned_syllabus = extract_clean_syllabus(file_path)
    print(cleaned_syllabus)