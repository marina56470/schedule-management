const supabase = require('../config/supabase');
 
module.exports = function validateInstitutionalEmail(email) {
  if (!email.endsWith('@uac.edu.co')) {
    throw new Error('Solo se permiten correos institucionales @uac.edu.co');
  }
};