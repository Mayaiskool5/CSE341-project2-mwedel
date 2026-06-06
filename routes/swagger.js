const fs = require('fs');
const path = require('path');
const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');

const swaggerDocumentPath = path.join(__dirname, '..', 'swagger.json');

const getSwaggerDocument = () => {
  try {
    const doc = JSON.parse(fs.readFileSync(swaggerDocumentPath, 'utf8'));

    // Dynamically update the host and scheme based on your environment
    if (process.env.NODE_ENV === 'production') {
      doc.host = 'cse341-project2-mwedel.onrender.com';
      doc.schemes = ['https'];
    } else {
      // Fallback defaults for your local machine if they aren't already set
      doc.host = doc.host || 'localhost:8080'; 
      doc.schemes = doc.schemes || ['http'];
    }

    return doc;
  } catch (err) {
    console.error('Failed to load swagger.json:', err);
    return { swagger: '2.0', info: { title: 'Swagger error', version: '1.0.0' }, paths: {} };
  }
};

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', (req, res, next) => {
  const swaggerDocument = getSwaggerDocument();
  return swaggerUi.setup(swaggerDocument)(req, res, next);
});

module.exports = router;