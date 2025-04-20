const fs = require('fs');
const pdfParse = require('pdf-parse');

function escapeTSV(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/<.*>/g, '' )
    .replace(/</g, '&lt;' )
    .replace(/>/g, '&gt;' )
    .replace(/\t/g, '  ')   // Replace tabs with two spaces
    .replace(/\n/g, ' ')   // Replace newlines with spaces
    .replace(/\r/g, ' ')   // Replace carriage returns with spaces
    .replace(/"/g, '""');  // Escape double quotes
}

async function convertSpeakerPdfToTsv(pdfFilePath, tsvFilePath) {
  try {
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(pdfFilePath);

    // Parse the PDF content
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    // Split the text into speaker profiles using the delimiter
    const profileDelimiter = /\s*\n\s*\n\s*\n\s*\n/;  //4 new lines
    const profiles = pdfText.split(profileDelimiter);

    let speakerData = [];

    for (const profile of profiles) {
      const lines = profile.split('\n')

      let currentSpeaker = {};

      // Extract Name and Title (first two lines)
      currentSpeaker.Name = lines[0] || '';
      currentSpeaker.Title = lines[1] || '';

      // Extract Affiliation and Location
      currentSpeaker.Affiliation = lines[2] || '';

      // Extract Biography (remaining lines)
      currentSpeaker.Biography = lines.slice(3).join('\n') || ''; // Join biography lines

      speakerData.push(currentSpeaker);
    }

    // Convert speaker data to TSV format
    const tsvHeader = 'Name\tTitle/Position\tAffiliation\tLocation\tBiography\n';
    const tsvRows = speakerData.map(speaker =>
      `${escapeTSV(speaker.Name)}\t${escapeTSV(speaker.Title)}\t${escapeTSV(speaker.Affiliation)}\t${escapeTSV(speaker.Location)}\t${escapeTSV(speaker.Biography)}`
    );
    const tsvContent = tsvHeader + tsvRows.join('\n\n');

    // Write TSV content to file
    fs.writeFileSync(tsvFilePath, tsvContent, 'utf-8');

    console.log(`Successfully converted ${speakerData.length} speaker profiles to ${tsvFilePath}`);
  } catch (error) {
    console.error('Error processing PDF:', error);
  }
}

// Get PDF file path from command line arguments
const pdfFilePath = process.argv[2];

// Set default TSV file path or take it from command line arguments
const tsvFilePath = process.argv[3] || 'speakers.tsv';

if (!pdfFilePath) {
  console.error('Please provide the PDF file path as a command line argument.');
  process.exit(1);
}

convertSpeakerPdfToTsv(pdfFilePath, tsvFilePath);

