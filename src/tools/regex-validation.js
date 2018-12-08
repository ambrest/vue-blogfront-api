function regexValidate(value, regex) {
    // Create Regex expression
    const regexp = new RegExp(regex, 'g');

    // Remove all non-wanted characters
    const newValue = value.replace(regexp, '');

    // Check newValue against old value
    return newValue === value;
}

module.exports = { regexValidate };
