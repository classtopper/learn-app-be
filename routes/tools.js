// routes/tools.js
const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const archiver = require('archiver');
const pdfParse = require('pdf-parse');
const officegen = require('officegen');
const tmp = require('tmp');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const streamBuffers = require('stream-buffers');

const router = express.Router();

// Multer setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// ------------------- Word to PDF -------------------
router.post('/convert-word-to-pdf', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Only Word files (DOC/DOCX) are allowed' });
    }

    // Save DOCX to temp file
    const tmpDoc = tmp.fileSync({ postfix: '.docx' });
    fs.writeFileSync(tmpDoc.name, file.buffer);

    // Convert with LibreOffice
    const outputDir = path.dirname(tmpDoc.name);
    execFile('libreoffice', [
      '--headless',
      '--convert-to', 'pdf',
      '--outdir', outputDir,
      tmpDoc.name
    ], (error) => {
      if (error) {
        console.error('LibreOffice error:', error);
        return res.status(500).json({ error: 'Failed to convert Word to PDF' });
      }

      const pdfPath = tmpDoc.name.replace(/\.docx$/, '.pdf');
      const pdfBuffer = fs.readFileSync(pdfPath);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
      res.send(pdfBuffer);

      tmpDoc.removeCallback();
      fs.unlinkSync(pdfPath);
    });

  } catch (err) {
    console.error('Word to PDF Error:', err.stack);
    res.status(500).json({ error: 'Conversion failed', details: err.message });
  }
});

// ------------------- PDF to Word -------------------
router.post('/convert-pdf-to-word', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file || file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    const data = await pdfParse(file.buffer);
    const text = data.text;

    const docx = officegen('docx');
    docx.on('error', (err) => { throw err; });

    const paragraph = docx.createP();
    paragraph.addText(text);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.docx');
    docx.generate(res);

  } catch (err) {
    console.error('PDF to Word Error:', err.stack);
    res.status(500).json({ error: 'Conversion failed', details: err.message });
  }
});

// ------------------- Image to PDF -------------------
router.post('/convert-image-to-pdf', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file || !file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    const pdfDoc = await PDFDocument.create();
    let image, dims;

    if (file.mimetype === 'image/jpeg') {
      image = await pdfDoc.embedJpg(file.buffer);
    } else if (file.mimetype === 'image/png') {
      image = await pdfDoc.embedPng(file.buffer);
    } else {
      return res.status(400).json({ error: 'Only JPG and PNG images supported' });
    }

    dims = image.scale(1);
    const page = pdfDoc.addPage([dims.width, dims.height]);

    page.drawImage(image, {
      x: 0,
      y: 0,
      width: dims.width,
      height: dims.height,
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error('Image to PDF Error:', err.stack);
    res.status(500).json({ error: 'Conversion failed', details: err.message });
  }
});

// ------------------- File Compression -------------------
router.post('/compress-file', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const outputBuffer = new streamBuffers.WritableStreamBuffer({
      initialSize: 1024 * 1024,
      incrementAmount: 1024 * 1024
    });

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(outputBuffer);
    archive.append(file.buffer, { name: file.originalname });

    // Finalize and wait for 'finish' to ensure all data is written
    await new Promise((resolve, reject) => {
      outputBuffer.on('finish', resolve);
      outputBuffer.on('error', reject);
      archive.finalize().catch(reject); // handle finalize error
    });

    const zipData = outputBuffer.getContents();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=compressed.zip');
    res.send(zipData);

  } catch (err) {
    console.error('Compression Error:', err.stack);
    res.status(500).json({ error: 'Compression failed', details: err.message });
  }
});


module.exports = router;
