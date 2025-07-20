// routes/generate.js
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const archiver = require('archiver');
const pngToIco = require('png-to-ico'); // ✅ NEW

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

const sizes = {
  favicon: [16, 32, 48, 64],
  logo: [64, 128, 256, 512]
};

// Helper: Create circular mask buffer
function createCircleMask(size) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white" />
    </svg>
  `;
  return Buffer.from(svg);
}

// Helper: Create ZIP with text or image
async function createZip({ imageBuffer, text, font, bgColor, textColor, type, mode, shape = 'square' }, res) {
  const sizeSet = sizes[type] || [64];
  const pngBuffers = [];

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=${type}-${mode}.zip`);

  const archive = archiver('zip');
  archive.pipe(res);

  try {
    for (const size of sizeSet) {
      let baseImage;

      if (mode === 'image' && imageBuffer) {
        baseImage = await sharp(imageBuffer).resize(size, size).toBuffer();
      } else {
        baseImage = await sharp({
          create: {
            width: size,
            height: size,
            channels: 4,
            background: bgColor || '#000000',
          }
        }).png().toBuffer();
      }

      const svgText = text ? `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="50%" font-size="${size / 3}" font-family="${font || 'Arial'}" fill="${textColor || '#ffffff'}"
                text-anchor="middle" dominant-baseline="middle">${text}</text>
        </svg>
      ` : null;

      let composedImage = svgText
        ? await sharp(baseImage).composite([{ input: Buffer.from(svgText) }]).png().toBuffer()
        : baseImage;

      // Apply circular mask if requested
      if (shape === 'circle') {
        composedImage = await sharp(composedImage)
          .composite([{ input: createCircleMask(size), blend: 'dest-in' }])
          .png()
          .toBuffer();
      }

      archive.append(composedImage, { name: `${type}-${mode}-${shape}-${size}x${size}.png` });

      if (type === 'favicon') {
        pngBuffers.push(composedImage); // only image buffer (not object)
      }
    }

    // ✅ Generate favicon.ico from PNGs
    if (type === 'favicon' && pngBuffers.length > 0) {
      try {
        const icoBuffer = await pngToIco(pngBuffers);
        archive.append(icoBuffer, { name: 'favicon.ico' });
      } catch (icoErr) {
        console.error('ICO generation failed:', icoErr.message);
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error('ZIP creation failed:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate ZIP' });
    }
  }
}

// Routes
router.post('/favicon-image', upload.single('image'), async (req, res) => {
  await createZip({ ...req.body, imageBuffer: req.file?.buffer || null, type: 'favicon', mode: 'image' }, res);
});

router.post('/favicon-text', upload.none(), async (req, res) => {
  await createZip({ ...req.body, type: 'favicon', mode: 'text' }, res);
});

router.post('/logo-image', upload.single('image'), async (req, res) => {
  await createZip({ ...req.body, imageBuffer: req.file?.buffer || null, type: 'logo', mode: 'image' }, res);
});

router.post('/logo-text', upload.none(), async (req, res) => {
  await createZip({ ...req.body, type: 'logo', mode: 'text' }, res);
});

router.post('/preview', upload.single('image'), async (req, res) => {
  try {
    const { text, font, bgColor, textColor, type, mode, shape } = req.body;
    const imageBuffer = req.file?.buffer || null;

    const size = 64; // Preview size fixed

    let baseImage;
    if (mode === 'image' && imageBuffer) {
      baseImage = await sharp(imageBuffer).resize(size, size).toBuffer();
    } else {
      baseImage = await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: bgColor || '#000000',
        }
      }).png().toBuffer();
    }

    const svgText = text ? `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <text x="50%" y="50%" font-size="${size / 3}" font-family="${font || 'Arial'}" fill="${textColor || '#ffffff'}"
              text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>
    ` : null;

    let composedImage = svgText
      ? await sharp(baseImage).composite([{ input: Buffer.from(svgText) }]).png().toBuffer()
      : baseImage;

    if (shape === 'circle') {
      const svgCircle = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
        </svg>
      `;
      composedImage = await sharp(composedImage)
        .composite([{ input: Buffer.from(svgCircle), blend: 'dest-in' }])
        .png()
        .toBuffer();
    }

    res.set('Content-Type', 'image/png');
    res.send(composedImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Preview generation failed' });
  }
});


module.exports = router;
