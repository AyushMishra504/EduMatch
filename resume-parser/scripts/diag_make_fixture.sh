#!/usr/bin/env bash
# Generates the PDF fixture on native FS (repo /mnt/c would be slow to read).
set -uo pipefail
cd /mnt/c/Users/ayush/Documents/coding/EduMatch/resume-parser
/home/ayush/venvs/resume-parser/bin/python tests/fixtures/make_pdf.py > /home/ayush/rp_fixture.pdf
/home/ayush/venvs/resume-parser/bin/python tests/fixtures/make_pdf.py --two-column > /home/ayush/rp_fixture_2col.pdf
ls -la /home/ayush/rp_fixture*.pdf