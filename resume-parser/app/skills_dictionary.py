"""Versioned skills dictionary + word-boundary matching (spec §18, §23).

Dictionary-based, never generative: a skill is returned only when one of
its aliases appears as a whole token. Aliases normalize to one canonical
name; results are deduplicated with a stable order.

Expand this dictionary from what users actually put in EduMatch profiles.
"""

from __future__ import annotations

import re

# canonical → aliases (matched case-insensitively, whole-token)
SKILLS: dict[str, list[str]] = {
    "Python": ["python"],
    "Java": ["java"],
    "JavaScript": ["javascript", "js"],
    "TypeScript": ["typescript", "ts"],
    "C": ["c programming", "c language"],
    "C++": ["c++", "cpp"],
    "C#": ["c#", "c sharp", ".net", "dotnet"],
    "Go": ["golang"],
    "Rust": ["rust"],
    "Kotlin": ["kotlin"],
    "Swift": ["swift"],
    "PHP": ["php"],
    "Ruby": ["ruby"],
    "React": ["react", "reactjs", "react.js"],
    "Angular": ["angular", "angularjs"],
    "Vue": ["vue", "vuejs", "vue.js"],
    "Next.js": ["next.js", "nextjs"],
    "Node.js": ["node.js", "nodejs"],
    "Express.js": ["express", "express.js", "expressjs"],
    "Django": ["django"],
    "Flask": ["flask"],
    "Spring": ["spring boot", "spring framework"],
    "HTML": ["html", "html5"],
    "CSS": ["css", "css3"],
    "Tailwind CSS": ["tailwind", "tailwind css"],
    "Bootstrap": ["bootstrap"],
    "Flutter": ["flutter"],
    "React Native": ["react native"],
    "SQL": ["sql"],
    "MySQL": ["mysql"],
    "PostgreSQL": ["postgresql", "postgres", "psql"],
    "MongoDB": ["mongodb", "mongo"],
    "Redis": ["redis"],
    "Oracle": ["oracle database", "oracle"],
    "Git": ["git"],
    "GitHub": ["github"],
    "GitLab": ["gitlab"],
    "Docker": ["docker"],
    "Kubernetes": ["kubernetes", "k8s"],
    "Linux": ["linux", "unix"],
    "AWS": ["aws", "amazon web services"],
    "Azure": ["azure", "microsoft azure"],
    "GCP": ["gcp", "google cloud"],
    "TensorFlow": ["tensorflow"],
    "PyTorch": ["pytorch"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "SVM": ["svm"],
    "pandas": ["pandas"],
    "NumPy": ["numpy"],
    "OpenCV": ["opencv"],
    "NLP": ["nlp", "natural language processing"],
    "Machine Learning": ["machine learning"],
    "Deep Learning": ["deep learning"],
    "Data Analysis": ["data analysis", "data analytics"],
    "Power BI": ["power bi"],
    "Tableau": ["tableau"],
    "Excel": ["microsoft excel", "advanced excel", "excel"],
    "MATLAB": ["matlab"],
    "SAS": ["sas"],
    "SPSS": ["spss"],
    "AutoCAD": ["autocad"],
    "SolidWorks": ["solidworks"],
    "LabVIEW": ["labview"],
    "Verilog": ["verilog"],
    "VHDL": ["vhdl"],
    "Assembly": ["assembly language", "arm assembly"],
    "REST API": ["rest api", "restful", "rest apis"],
    "GraphQL": ["graphql"],
    "Microservices": ["microservices", "microservices architecture"],
    "Agile": ["agile", "scrum"],
    "CI/CD": ["ci/cd", "cicd", "continuous integration"],
    "Jira": ["jira"],
    "Figma": ["figma"],
    "Photoshop": ["photoshop", "adobe photoshop"],
    "Communication": ["communication skills", "effective communication"],
    "Leadership": ["leadership"],
    "Teamwork": ["teamwork", "team player"],
    "Problem Solving": ["problem solving", "problem-solving"],
    "Teaching": ["teaching", "mentoring", "tutoring"],
    "Public Speaking": ["public speaking", "presentation skills"],
    "Project Management": ["project management"],
}

_TOKEN_RE = re.compile(r"(?<![A-Za-z0-9+#.]){alias}(?![A-Za-z0-9+#])")
# Single-letter / very short aliases that would over-match need boundaries
# that also exclude adjacent letters on both sides (handled above).
_COMPILED: list[tuple[str, list[re.Pattern[str]]]] = []


def _compile() -> None:
    if _COMPILED:
        return
    for canonical, aliases in SKILLS.items():
        patterns = [
            re.compile(
                _TOKEN_RE.pattern.replace("{alias}", re.escape(alias)),
                re.IGNORECASE,
            )
            for alias in aliases
        ]
        _COMPILED.append((canonical, patterns))


def match_skills(text: str) -> list[str]:
    """Canonical skills found in text, in dictionary order, deduped."""
    _compile()
    found: list[str] = []
    for canonical, patterns in _COMPILED:
        if any(pattern.search(text) for pattern in patterns):
            found.append(canonical)
    return found
