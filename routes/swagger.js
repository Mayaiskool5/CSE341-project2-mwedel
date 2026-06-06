const fs = require('fs');
const path = require('path');
const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');

const swaggerDocumentPath = path.join(__dirname, '..', 'swagger.json');

const getSwaggerDocument = () => {
  try {
    return JSON.parse(fs.readFileSync(swaggerDocumentPath, 'utf8'));
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