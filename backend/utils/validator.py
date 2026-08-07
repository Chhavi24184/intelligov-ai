def validate_age(age):
    if age < 0 or age > 120:
        raise ValueError("Age must be between 0 and 120.")
    return True


def validate_income(income):
    if income < 0:
        raise ValueError("Income cannot be negative.")
    return True


def validate_gender(gender):
    allowed_genders = ["male", "female", "other"]

    if gender.lower() not in allowed_genders:
        raise ValueError("Gender must be Male, Female or Other.")

    return True


def validate_state(state):
    if not state.strip():
        raise ValueError("State cannot be empty.")
    return True


def validate_occupation(occupation):
    if not occupation.strip():
        raise ValueError("Occupation cannot be empty.")
    return True