// String module with String Comparison, Trimming, Padding, and other string operations

// Function to concatenate two strings
fun concatenate(str1: String, str2: String): String {
    return str1 ++ str2;
}

// Function to extract a substring
fun substring(str: String, start: Int, length: Int): String {
    return str.sub(start, length);
}

// Function to get the length of a string
fun length(str: String): Int {
    return str.len();
}

// Function to compare two strings lexicographically
fun compare(str1: String, str2: String): Int {
    if (str1 == str2) {
        return 0;
    } else if (str1 < str2) {
        return -1;
    } else {
        return 1;
    }
}

// Function to convert an integer to a string
fun intToString(num: Int): String {
    return num.toStr();
}

// Function to access a character in a string at a specific index
fun charAt(str: String, index: Int): String {
    require(index >= 0 && index < str.len(), "Index out of bounds");
    return str.sub(index, 1);
}

// Function to check if a string contains a specific substring using regular expressions
fun contains(str: String, pattern: String): Bool {
    let regex = pattern.toRegexp();
    return regex.match(str) != null;
}

// Function to trim whitespace from the beginning and end of a string
fun trim(str: String): String {
    return str.trim();
}

// Function to pad a string with specified characters on the left
fun padLeft(str: String, length: Int, char: String): String {
    let diff = length - str.len();
    if (diff <= 0) {
        return str;
    }
    return char.repeat(diff) ++ str;
}

// Function to pad a string with specified characters on the right
fun padRight(str: String, length: Int, char: String): String {
    let diff = length - str.len();
    if (diff <= 0) {
        return str;
    }
    return str ++ char.repeat(diff);
}

// Example usage
// let concatenated = concatenate("Hello, ", "World!");
// let sub = substring("Hello, World!", 7, 5);
// let len = length("Hello");
// let cmp = compare("abc", "def");
// let str = intToString(123);
// let char = charAt("Hello", 2);
// let containsPattern = contains("Hello, World!", "World");
// let trimmed = trim("  Hello, World!  ");
// let paddedLeft = padLeft("Hello", 10, "*");
// let paddedRight = padRight("Hello", 10, "*");

// Unicode support is inherent in Tact's string operations, ensuring compatibility with different characters and symbols.
