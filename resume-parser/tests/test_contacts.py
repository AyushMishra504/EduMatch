"""Contact extraction: email, phone, links, name, location (spec §16)."""

from app.normalizer import (
    find_email,
    find_links,
    find_name,
    find_orcid,
    find_eligibility_hints,
    find_phone,
    parse_location,
)


def test_email_regex_and_lowercase():
    text = "Reach me at Ayush.Mishra@Example.COM for details."
    assert find_email(text) == "ayush.mishra@example.com"


def test_email_none_when_absent():
    assert find_email("No contact details here.") is None


def test_phone_indian_plus91():
    assert find_phone("Call +91 98765 43210 anytime") == "+919876543210"


def test_phone_zero_prefixed():
    assert find_phone("09876543210") == "+919876543210"


def test_phone_bare_10_digit_with_region():
    assert find_phone("Mobile 98765 43210") == "+919876543210"


def test_phone_invalid_number_ignored():
    assert find_phone("Pin 123456") is None


def test_links_split_linkedin_github_portfolio():
    text = (
        "linkedin.com/in/ayushmishra github.com/ayush "
        "https://ayush.dev"
    )
    links = find_links(text)
    assert links["linkedin"] == "https://linkedin.com/in/ayushmishra"
    assert links["github"] == "https://github.com/ayush"
    assert links["portfolio"] == "https://ayush.dev"


def test_portfolio_excludes_social_noise():
    links = find_links("https://www.youtube.com/@ayush https://maps.app/x")
    assert links["portfolio"] is None


def test_orcid_pattern():
    assert find_orcid("ORCID: 0000-0002-1825-0097") == "0000-0002-1825-0097"
    assert find_orcid("nothing here") is None


def test_eligibility_hints_dictionary():
    text = "Qualified UGC-NET (2023) and CSIR NET. GATE score 98.2. JRF holder. SLET cleared."
    hints = find_eligibility_hints(text)
    assert "UGC-NET" in hints
    assert "CSIR-NET" in hints
    assert "JRF" in hints
    assert "GATE" in hints
    assert "SET" in hints


def test_eligibility_hints_ignore_bare_set_word():
    # "SET" alone is too noisy — only qualified/exam contexts count.
    assert "SET" not in find_eligibility_hints("A set of skills")


def test_name_picks_first_plausible_line():
    lines = ["AYUSH MISHRA", "ayush@example.com", "+91 98765 43210"]
    assert find_name(lines) == "AYUSH MISHRA"


def test_name_rejects_labels_and_taglines():
    lines = ["RESUME", "CURRICULUM VITAE", "Software Engineer | Student"]
    assert find_name(lines) is None


def test_name_rejects_contact_noise():
    assert find_name(["ayush@example.com", "+91 98765 43210"]) is None


def test_location_city_and_state():
    assert parse_location("Pune, Maharashtra") == "Pune, Maharashtra"


def test_location_strips_country_suffix():
    assert parse_location("Bengaluru, Karnataka, India") == "Bengaluru, Karnataka"


def test_location_state_only():
    assert parse_location("Maharashtra") == "Maharashtra"


def test_location_bare_city():
    assert parse_location("Chennai") == "Chennai"


def test_location_rejects_email_phone_url_lines():
    assert parse_location("ayush@example.com") is None
    assert parse_location("+91 98765 43210") is None
    assert parse_location("linkedin.com/in/ayush") is None


def test_location_does_not_return_own_name_as_city():
    assert parse_location("Ayush", name="Ayush") is None
