const fs = require('fs');
const path = require('path');

function escapeForJavaScript(str) {
    return str
        .replace(/\\/g, '\\\\')  // Escape backslashes first
        .replace(/"/g, '\\"')    // Escape double quotes
        .replace(/'/g, "\\'")    // Escape single quotes
        .replace(/\n/g, '\\n')   // Escape newlines
        .replace(/\r/g, '\\r')    // Escape carriage returns
        .replace(/\t/g, '\\t');   // Escape tabs
}

function tsvToJsString(tsvData) {
    const rows = tsvData.split(/\r?\n/); // Handle both Unix and Windows line endings
    const jsArray = rows.map(row => {
        if (row.trim() === '') return []; // Skip empty rows
        return row.split('\t').map(col => escapeForJavaScript(col));
    }).filter(row => row.length > 0); // Filter out empty rows
    
    // Convert to JavaScript string representation
    let jsString = '[\n';
    jsString += jsArray.map(row => {
        return '  ["' + row.join('", "') + '"]';
    }).join(',\n');
    jsString += '\n]';
    
    return jsString;
}

// Main program
if (process.argv.length < 3) {
    console.error('Usage: node tsv-to-js.js <filename.tsv>');
    process.exit(1);
}

const filename = process.argv[2];

try {
    // Read the TSV file
    const tsvData = fs.readFileSync(filename, 'utf8');
    
    // Convert to JavaScript string
    const jsString = tsvToJsString(tsvData);
    
    // Output the result
    console.log(jsString);
} catch (err) {
    console.error(`Error processing file: ${err.message}`);
    process.exit(1);
}