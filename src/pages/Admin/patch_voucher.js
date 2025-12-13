const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('d:\\projects\\noname\\ejpeace-marketplace-fe\\src\\pages\\Admin\\CreateVoucher.jsx');
const newBlockFile = path.resolve('d:\\projects\\noname\\ejpeace-marketplace-fe\\src\\pages\\Admin\\new_block.txt');

try {
    const fileContent = fs.readFileSync(targetFile, 'utf8').split('\n');
    const newBlock = fs.readFileSync(newBlockFile, 'utf8');

    // Verification
    const startLine = fileContent[461] || "";
    const endLine = fileContent[590] || "";

    console.log('Verifying patch location...');
    console.log('Line 462 starts with:', startLine.trim().substring(0, 20));
    // Expect "{!form.apply_to_all"

    if (!startLine.includes('!form.apply_to_all')) {
        console.error('ERROR: Start line mismatch! Aborting patch.');
        console.error('Found:', startLine);
        process.exit(1);
    }

    // Splice
    // Removing 130 lines starting from index 461
    // Inserting the newBlock string (as a single array element, effectively)
    fileContent.splice(461, 130, newBlock);

    fs.writeFileSync(targetFile, fileContent.join('\n'));
    console.log('Patched successfully');
} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
